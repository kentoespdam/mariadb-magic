package api

import (
	"encoding/json"
	"net/http"

	"magic-mariadb/internal/maint"
)

type MaintHandler struct {
	retention *maint.Retention
}

func NewMaintHandler(retention *maint.Retention) *MaintHandler {
	return &MaintHandler{retention: retention}
}

func (h *MaintHandler) GetStats(w http.ResponseWriter, r *http.Request) {
	stats, err := h.retention.GetStats(r.Context())
	if err != nil {
		WriteError(w, r, CodeInternal, "failed to get stats", nil, http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(stats)
}

func (h *MaintHandler) TriggerEvict(w http.ResponseWriter, r *http.Request) {
	if err := h.retention.TriggerEvict(r.Context()); err != nil {
		WriteError(w, r, CodeInternal, "failed to trigger evict", nil, http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	w.Write([]byte(`{"status":"ok"}`))
}
