package api

import (
	"database/sql"
	"encoding/json"
	"net/http"
	"strings"

	"magic-mariadb/internal/crypto"
	"magic-mariadb/internal/repo"
)

type ConnectionHandler struct {
	repo          *repo.ConnectionsRepo
	sessionsRepo  *repo.SyncSessionsRepo
	profilesRepo  *repo.MappingProfilesRepo
	crypto        crypto.KeyProvider
}

func NewConnectionHandler(db *sql.DB, keyProvider crypto.KeyProvider) *ConnectionHandler {
	return &ConnectionHandler{
		repo:          repo.NewConnectionsRepo(db),
		sessionsRepo:  repo.NewSyncSessionsRepo(db),
		profilesRepo: repo.NewMappingProfilesRepo(db),
		crypto:        keyProvider,
	}
}

func (h *ConnectionHandler) Handle(w http.ResponseWriter, r *http.Request) {
	path := strings.TrimPrefix(r.URL.Path, "/api/connections")
	if path == "" || path == "/" {
		switch r.Method {
		case "GET":
			h.List(w, r)
		case "POST":
			h.Create(w, r)
		default:
			WriteError(w, r, CodeMethodNotAllowed, "method not allowed", nil, http.StatusMethodNotAllowed)
		}
		return
	}

	path = strings.TrimPrefix(path, "/")
	if path == "batch" && r.Method == "POST" {
		h.BatchCreate(w, r)
		return
	}

	if path == "test" && r.Method == "POST" {
		h.TestPreSave(w, r)
		return
	}

	id := strings.Split(path, "/")[0]
	if id == "" {
		WriteError(w, r, CodeNotFound, "not found", nil, http.StatusNotFound)
		return
	}

	if strings.HasSuffix(path, "/test") && r.Method == "GET" {
		h.TestPostSave(w, r)
		return
	}

	switch r.Method {
	case "GET":
		h.Get(w, r)
	case "PUT":
		h.Update(w, r)
	case "DELETE":
		h.Delete(w, r)
	default:
		WriteError(w, r, CodeMethodNotAllowed, "method not allowed", nil, http.StatusMethodNotAllowed)
	}
}

func getID(r *http.Request) string {
	path := strings.TrimPrefix(r.URL.Path, "/api/connections/")
	return strings.Split(path, "/")[0]
}

func (h *ConnectionHandler) List(w http.ResponseWriter, r *http.Request) {
	conns, err := h.repo.List()
	if err != nil {
		WriteError(w, r, CodeInternal, "failed to list connections", nil, http.StatusInternalServerError)
		return
	}
	resp := make([]ConnectionResponse, len(conns))
	for i, c := range conns {
		resp[i] = toConnectionResponse(&c)
	}
	json.NewEncoder(w).Encode(resp)
}

func (h *ConnectionHandler) Get(w http.ResponseWriter, r *http.Request) {
	id := getID(r)
	conn, err := h.repo.Get(id)
	if err != nil {
		WriteError(w, r, CodeInternal, "failed to get connection", nil, http.StatusInternalServerError)
		return
	}
	if conn == nil {
		WriteError(w, r, CodeNotFound, "not found", nil, http.StatusNotFound)
		return
	}
	json.NewEncoder(w).Encode(toConnectionResponse(conn))
}

func (h *ConnectionHandler) Create(w http.ResponseWriter, r *http.Request) {
	var req CreateConnectionRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		WriteError(w, r, CodeBadRequest, "invalid request body", nil, http.StatusBadRequest)
		return
	}

	ciphertext, nonce, err := h.crypto.Encrypt(req.Password)
	if err != nil {
		WriteError(w, r, CodeInternal, "failed to encrypt password", nil, http.StatusInternalServerError)
		return
	}

	conn := &repo.Connection{
		Name:               req.Name,
		Host:               req.Host,
		Port:               req.Port,
		User:               req.User,
		Database:           req.Database,
		PasswordCiphertext: ciphertext + ":" + nonce,
	}
	if err := h.repo.Create(conn); err != nil {
		WriteError(w, r, CodeInternal, "failed to create connection", nil, http.StatusInternalServerError)
		return
	}
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(toConnectionResponse(conn))
}