package api

import (
    "encoding/json"
    "net/http"
)

// ListSessions returns all sync sessions via runner.
func (h *ProfilesHandler) ListSessions(w http.ResponseWriter, r *http.Request) {
    sessions, err := h.runner.ListSessions()
    if err != nil {
        WriteError(w, r, CodeInternal, "failed to list sessions", nil, http.StatusInternalServerError)
        return
    }
    json.NewEncoder(w).Encode(sessions)
}

// GetSession returns a specific session by ID.
func (h *ProfilesHandler) GetSession(w http.ResponseWriter, r *http.Request, id string) {
    session, err := h.runner.GetSession(id)
    if err != nil {
        WriteError(w, r, CodeInternal, "failed to get session", nil, http.StatusInternalServerError)
        return
    }
    if session == nil {
        WriteError(w, r, CodeNotFound, "not found", nil, http.StatusNotFound)
        return
    }
    json.NewEncoder(w).Encode(session)
}

// StartSession initiates a new sync session.
func (h *ProfilesHandler) StartSession(w http.ResponseWriter, r *http.Request) {
    var req struct {
        ProfileID string `json:"profile_id"`
    }
    if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
        WriteError(w, r, CodeBadRequest, "invalid request body", nil, http.StatusBadRequest)
        return
    }
    canStart, conflictID, conflictName, err := h.runner.CanStart()
    if err != nil {
        WriteError(w, r, CodeInternal, "failed to check session", nil, http.StatusInternalServerError)
        return
    }
    if !canStart {
        w.WriteHeader(http.StatusConflict)
        json.NewEncoder(w).Encode(map[string]interface{}{
            "error_friendly":   "Session sync lain sedang berlangsung",
            "conflict_session": conflictID,
            "conflict_profile": conflictName,
        })
        return
    }
    session, err := h.runner.StartSession(r.Context(), req.ProfileID)
    if err != nil {
        WriteError(w, r, CodeInternal, "failed to start session", nil, http.StatusInternalServerError)
        return
    }
    w.WriteHeader(http.StatusAccepted)
    json.NewEncoder(w).Encode(session)
}

// CancelSession cancels a running session.
func (h *ProfilesHandler) CancelSession(w http.ResponseWriter, r *http.Request, id string) {
    if err := h.runner.Cancel(id); err != nil {
        WriteError(w, r, CodeInternal, "failed to cancel session", nil, http.StatusInternalServerError)
        return
    }
    w.WriteHeader(http.StatusOK)
    json.NewEncoder(w).Encode(map[string]string{"status": "cancelled"})
}
