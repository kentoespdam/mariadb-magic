package api

import (
	"encoding/json"
	"net/http"

	"magic-mariadb/internal/repo"
)

func (h *ConnectionHandler) Update(w http.ResponseWriter, r *http.Request) {
	id := getID(r)
	var req CreateConnectionRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		WriteError(w, r, CodeBadRequest, "invalid request body", nil, http.StatusBadRequest)
		return
	}

	existing, err := h.repo.Get(id)
	if err != nil {
		WriteError(w, r, CodeInternal, "failed to get connection", nil, http.StatusInternalServerError)
		return
	}
	if existing == nil {
		WriteError(w, r, CodeNotFound, "not found", nil, http.StatusNotFound)
		return
	}

	conn := &repo.Connection{
		ID:                 id,
		Name:               req.Name,
		Host:               req.Host,
		Port:               req.Port,
		User:               req.User,
		Database:           req.Database,
		PasswordCiphertext: existing.PasswordCiphertext,
	}

	if req.Password != "" {
		ciphertext, nonce, err := h.crypto.Encrypt(req.Password)
		if err != nil {
			WriteError(w, r, CodeInternal, "failed to encrypt password", nil, http.StatusInternalServerError)
			return
		}
		conn.PasswordCiphertext = ciphertext + ":" + nonce
		if err := h.repo.Update(conn); err != nil {
			WriteError(w, r, CodeInternal, "failed to update connection", nil, http.StatusInternalServerError)
			return
		}
	} else {
		if err := h.repo.UpdateWithoutPassword(conn); err != nil {
			WriteError(w, r, CodeInternal, "failed to update connection", nil, http.StatusInternalServerError)
			return
		}
	}
	json.NewEncoder(w).Encode(toConnectionResponse(conn))
}