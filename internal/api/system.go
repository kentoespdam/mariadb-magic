package api

import (
	"encoding/json"
	"net/http"
	"strings"

	"magic-mariadb/internal/config"
)

type SystemHandler struct {
	cfg *config.Config
}

func NewSystemHandler(cfg *config.Config) *SystemHandler {
	return &SystemHandler{cfg: cfg}
}

func (h *SystemHandler) Info(w http.ResponseWriter, r *http.Request) {
	remoteExposed := isRemoteExposed(h.cfg.ListenAddr)

	resp := map[string]interface{}{
		"remote_exposed": remoteExposed,
		"version":        "v0.1.0-dev",
		"app_env":        h.cfg.AppEnv,
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(resp)
}

func isRemoteExposed(listenAddr string) bool {
	host := strings.Split(listenAddr, ":")[0]
	return host != "127.0.0.1" && host != "localhost" && host != "::1"
}