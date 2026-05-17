package api

import (
	"encoding/json"
	"net/http"
	"strings"

	"magic-mariadb/internal/mariadb"
)

func (h *ConnectionHandler) TestPreSave(w http.ResponseWriter, r *http.Request) {
	var req CreateConnectionRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		WriteError(w, r, CodeBadRequest, "invalid request body", nil, http.StatusBadRequest)
		return
	}

	cfg := mariadb.Config{
		Host:     req.Host,
		Port:     req.Port,
		User:     req.User,
		Password: req.Password,
		DBName:   req.Database,
	}
	err := mariadb.TestConnection(cfg)
	if err != nil {
		WriteError(w, r, CodeBadRequest, err.Error(), nil, http.StatusBadRequest)
		return
	}
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]string{"status": "ok"})
}

func (h *ConnectionHandler) TestPostSave(w http.ResponseWriter, r *http.Request) {
	id := getID(r)
	conn, err := h.repo.Get(id)
	if err != nil || conn == nil {
		WriteError(w, r, CodeNotFound, "not found", nil, http.StatusNotFound)
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
		WriteError(w, r, CodeInternal, "failed to decrypt password", nil, http.StatusInternalServerError)
		return
	}

	cfg := mariadb.Config{
		Host:     conn.Host,
		Port:     conn.Port,
		User:     conn.User,
		Password: passplain,
		DBName:   conn.Database,
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