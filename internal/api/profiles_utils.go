package api

import (
    "strings"
    "net/http"
    "magic-mariadb/internal/crypto"
)

func getProfileID(r *http.Request) string {
    path := strings.TrimPrefix(r.URL.Path, "/api/profiles/")
    return strings.Split(path, "/")[0]
}

func (h *ProfilesHandler) decryptPassword(ciphertext string) (string, error) {
	return crypto.DecryptStoredCredential(h.crypto, ciphertext)
}