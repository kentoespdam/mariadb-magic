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
	cursor := r.URL.Query().Get("cursor") // FE uses 'cursor' instead of 'offset' for pagination

	limit := 100
	if limitStr != "" {
		fmt.Sscanf(limitStr, "%d", &limit)
	}

	var logs []repo.SyncLog
	var nextCursor string
	var err error

	if codeStr != "" {
		var code int
		fmt.Sscanf(codeStr, "%d", &code)
		// For filtered logs, we don't have cursor-based pagination yet in repo, so use ListByCode
		// But we should still wrap it in the expected shape.
		offsetStr := r.URL.Query().Get("offset")
		offset := 0
		fmt.Sscanf(offsetStr, "%d", &offset)
		logs, err = h.logsRepo.ListByCode(sessionID, code, limit, offset)
	} else {
		logs, nextCursor, err = h.logsRepo.ListPaginated(sessionID, cursor, limit)
	}

	if err != nil {
		WriteError(w, r, CodeInternal, "failed to get logs", err.Error(), http.StatusInternalServerError)
		return
	}

	if logs == nil {
		logs = []repo.SyncLog{}
	}

	response := struct {
		Items      []repo.SyncLog `json:"items"`
		NextCursor string         `json:"next_cursor"`
	}{
		Items:      logs,
		NextCursor: nextCursor,
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}