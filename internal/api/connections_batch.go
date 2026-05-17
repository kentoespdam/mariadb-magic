package api

import (
	"database/sql"
	"encoding/json"
	"net/http"

	"magic-mariadb/internal/repo"
)

type BatchCreateRequest struct {
	Source      CreateConnectionRequest `json:"source"`
	Destination CreateConnectionRequest `json:"destination"`
}

type BatchCreateResponse struct {
	Source      ConnectionResponse `json:"source"`
	Destination ConnectionResponse `json:"destination"`
}

func (h *ConnectionHandler) BatchCreate(w http.ResponseWriter, r *http.Request) {
	var req BatchCreateRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		WriteError(w, r, CodeBadRequest, "invalid request body", nil, http.StatusBadRequest)
		return
	}

	srcCipher, srcNonce, err := h.crypto.Encrypt(req.Source.Password)
	if err != nil {
		WriteError(w, r, CodeInternal, "failed to encrypt source password", nil, http.StatusInternalServerError)
		return
	}
	srcConn := &repo.Connection{
		Name:               req.Source.Name,
		Host:               req.Source.Host,
		Port:               req.Source.Port,
		User:               req.Source.User,
		Database:           req.Source.Database,
		PasswordCiphertext: srcCipher + ":" + srcNonce,
	}

	destCipher, destNonce, err := h.crypto.Encrypt(req.Destination.Password)
	if err != nil {
		WriteError(w, r, CodeInternal, "failed to encrypt destination password", nil, http.StatusInternalServerError)
		return
	}
	destConn := &repo.Connection{
		Name:               req.Destination.Name,
		Host:               req.Destination.Host,
		Port:               req.Destination.Port,
		User:               req.Destination.User,
		Database:           req.Destination.Database,
		PasswordCiphertext: destCipher + ":" + destNonce,
	}

	if err := repo.ExecTx(h.repo.DB(), func(tx *sql.Tx) error {
		if err := h.repo.Create(srcConn); err != nil {
			return err
		}
		if err := h.repo.Create(destConn); err != nil {
			return err
		}
		return nil
	}); err != nil {
		WriteError(w, r, CodeInternal, "failed to create connections", nil, http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(BatchCreateResponse{
		Source:      toConnectionResponse(srcConn),
		Destination: toConnectionResponse(destConn),
	})
}