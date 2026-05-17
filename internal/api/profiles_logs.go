package api

import (
    "encoding/json"
    "net/http"
    "fmt"
    "magic-mariadb/internal/repo"
)

// GetSessionLogGroups returns log groups for a session.
func (h *ProfilesHandler) GetSessionLogGroups(w http.ResponseWriter, r *http.Request, sessionID string) {
    groups, err := h.logsRepo.GetGroupsByCode(sessionID)
    if err != nil {
        WriteError(w, r, CodeInternal, "failed to get log groups", nil, http.StatusInternalServerError)
        return
    }
    if groups == nil {
        groups = []repo.LogGroup{}
    }
    json.NewEncoder(w).Encode(groups)
}

// GetSessionLogs returns logs for a session.
func (h *ProfilesHandler) GetSessionLogs(w http.ResponseWriter, r *http.Request, sessionID string) {
    codeStr := r.URL.Query().Get("mariadb_code")
    limitStr := r.URL.Query().Get("limit")
    offsetStr := r.URL.Query().Get("offset")

    var code int
    if codeStr != "" {
        fmt.Sscanf(codeStr, "%d", &code)
    }
    limit := 50
    offset := 0
    fmt.Sscanf(limitStr, "%d", &limit)
    fmt.Sscanf(offsetStr, "%d", &offset)

    var logs []repo.SyncLog
    var err error
    if codeStr != "" {
        logs, err = h.logsRepo.ListByCode(sessionID, code, limit, offset)
    } else {
        logs, err = h.logsRepo.ListBySession(sessionID)
        if len(logs) > limit {
            logs = logs[offset : offset+limit]
        }
    }
    if err != nil {
        WriteError(w, r, CodeInternal, "failed to get logs", nil, http.StatusInternalServerError)
        return
    }
    if logs == nil {
        logs = []repo.SyncLog{}
    }
    json.NewEncoder(w).Encode(logs)
}