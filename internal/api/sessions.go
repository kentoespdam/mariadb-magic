package api

import (
	"database/sql"
	"encoding/json"
	"net/http"

	"magic-mariadb/internal/repo"
	"magic-mariadb/internal/sync/runner"
	"magic-mariadb/internal/crypto"
)

type SessionsHandler struct {
	runner    *runner.Runner
	logsRepo  *repo.SyncLogsRepo
}

func NewSessionsHandler(db *sql.DB, chunkSize int, crypto crypto.KeyProvider) *SessionsHandler {
	sessionsRepo := repo.NewSyncSessionsRepo(db)
	logsRepo := repo.NewSyncLogsRepo(db)
	return &SessionsHandler{
		runner:   runner.New(sessionsRepo, logsRepo, chunkSize, crypto),
		logsRepo: logsRepo,
	}
}

func (h *SessionsHandler) List(w http.ResponseWriter, r *http.Request) {
	sessions, err := h.runner.ListSessions()
	if err != nil {
		WriteError(w, r, CodeInternal, "failed to list sessions", nil, http.StatusInternalServerError)
		return
	}
	json.NewEncoder(w).Encode(sessions)
}

func (h *SessionsHandler) Get(w http.ResponseWriter, r *http.Request) {
	id := getSessionID(r)
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

func (h *SessionsHandler) Start(w http.ResponseWriter, r *http.Request) {
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

func (h *SessionsHandler) Cancel(w http.ResponseWriter, r *http.Request) {
	id := getSessionID(r)
	if err := h.runner.Cancel(id); err != nil {
		WriteError(w, r, CodeInternal, "failed to cancel session", nil, http.StatusInternalServerError)
		return
	}
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]string{"status": "cancelled"})
}

func (h *SessionsHandler) Logs(w http.ResponseWriter, r *http.Request) {
	id := getSessionID(r)
	if id == "" {
		WriteError(w, r, CodeBadRequest, "session id required", nil, http.StatusBadRequest)
		return
	}

	limit := 100
	if l := r.URL.Query().Get("limit"); l != "" {
		limit = 100
	}
	cursor := r.URL.Query().Get("cursor")

	logs, nextCursor, err := h.logsRepo.ListPaginated(id, cursor, limit)
	if err != nil {
		WriteError(w, r, CodeInternal, "failed to list logs", nil, http.StatusInternalServerError)
		return
	}

	response := struct {
		Items      []repo.SyncLog `json:"items"`
		NextCursor string         `json:"next_cursor"`
	}{
		Items:      logs,
		NextCursor: nextCursor,
	}
	json.NewEncoder(w).Encode(response)
}

func getSessionID(r *http.Request) string {
	path := r.URL.Path
	id := path
	if idx := -1; true {
		for i := len(path) - 1; i >= 0; i-- {
			if path[i] == '/' {
				idx = i + 1
				break
			}
		}
		id = path[idx:]
	}
	return id
}
