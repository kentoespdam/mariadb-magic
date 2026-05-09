package api

import (
	"database/sql"
	"encoding/json"
	"net/http"
	"strings"

	"magic-mariadb/internal/crypto"
	"magic-mariadb/internal/mariadb"
	"magic-mariadb/internal/repo"
)

type ConnectionHandler struct {
	repo    *repo.ConnectionsRepo
	crypto  crypto.KeyProvider
}

func NewConnectionHandler(db *sql.DB, keyProvider crypto.KeyProvider) *ConnectionHandler {
	return &ConnectionHandler{
		repo:   repo.NewConnectionsRepo(db),
		crypto: keyProvider,
	}
}

func (h *ConnectionHandler) Handle(w http.ResponseWriter, r *http.Request) {
	path := strings.TrimPrefix(r.URL.Path, "/api/connections/")
	if path == "" {
		switch r.Method {
		case "GET":
			h.List(w, r)
		case "POST":
			h.Create(w, r)
		default:
			http.Error(w, "method not allowed", http.StatusMethodNotAllowed)
		}
		return
	}

	id := strings.Split(path, "/")[0]
	if id == "" {
		http.Error(w, "not found", http.StatusNotFound)
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
		http.Error(w, "method not allowed", http.StatusMethodNotAllowed)
	}
}

func getID(r *http.Request) string {
	path := strings.TrimPrefix(r.URL.Path, "/api/connections/")
	return strings.Split(path, "/")[0]
}

type CreateConnectionRequest struct {
	Name     string `json:"name"`
	Host     string `json:"host"`
	Port     int    `json:"port"`
	User     string `json:"user"`
	Password string `json:"password"`
}

func (h *ConnectionHandler) List(w http.ResponseWriter, r *http.Request) {
	conns, err := h.repo.List()
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	json.NewEncoder(w).Encode(conns)
}

func (h *ConnectionHandler) Get(w http.ResponseWriter, r *http.Request) {
	id := getID(r)
	conn, err := h.repo.Get(id)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	if conn == nil {
		http.Error(w, "not found", http.StatusNotFound)
		return
	}
	json.NewEncoder(w).Encode(conn)
}

func (h *ConnectionHandler) Create(w http.ResponseWriter, r *http.Request) {
	var req CreateConnectionRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	ciphertext, nonce, err := h.crypto.Encrypt(req.Password)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	conn := &repo.Connection{
		ID:                  req.Name,
		Host:              req.Host,
		Port:              req.Port,
		User:              req.User,
		PasswordCiphertext: ciphertext + ":" + nonce,
	}
	if err := h.repo.Create(conn); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(conn)
}

func (h *ConnectionHandler) Update(w http.ResponseWriter, r *http.Request) {
	id := getID(r)
	var req CreateConnectionRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	ciphertext, nonce, err := h.crypto.Encrypt(req.Password)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	conn := &repo.Connection{
		ID:                  id,
		Name:              req.Name,
		Host:              req.Host,
		Port:              req.Port,
		User:              req.User,
		PasswordCiphertext: ciphertext + ":" + nonce,
	}
	if err := h.repo.Update(conn); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	json.NewEncoder(w).Encode(conn)
}

func (h *ConnectionHandler) Delete(w http.ResponseWriter, r *http.Request) {
	id := getID(r)
	if err := h.repo.Delete(id); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	w.WriteHeader(http.StatusNoContent)
}

func (h *ConnectionHandler) TestPreSave(w http.ResponseWriter, r *http.Request) {
	var req CreateConnectionRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	cfg := mariadb.Config{
		Host:     req.Host,
		Port:     req.Port,
		User:     req.User,
		Password: req.Password,
	}
	err := mariadb.TestConnection(cfg)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]string{"status": "ok"})
}

func (h *ConnectionHandler) TestPostSave(w http.ResponseWriter, r *http.Request) {
	id := getID(r)
	conn, err := h.repo.Get(id)
	if err != nil || conn == nil {
		http.Error(w, "not found", http.StatusNotFound)
		return
	}

	parts := strings.Split(conn.PasswordCiphertext, ":")
	var passplain string
	if len(parts) == 2 {
		passplain, err = h.crypto.Decrypt(parts[0], parts[1])
	} else {
		passplain, err = h.crypto.Decrypt(conn.PasswordCiphertext, "")
	}
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	cfg := mariadb.Config{
		Host:     conn.Host,
		Port:     conn.Port,
		User:     conn.User,
		Password: passplain,
	}
	err = mariadb.TestConnection(cfg)
	status := "ok"
	var friendly string
	if err != nil {
		status = "failed"
		friendly = err.Error()
	}

	h.repo.UpdateTestStatus(id, status, friendly)
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]string{"status": status, "error": friendly})
}