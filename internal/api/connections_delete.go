package api

import (
	"database/sql"
	"net/http"

	"magic-mariadb/internal/repo"
)

func (h *ConnectionHandler) Delete(w http.ResponseWriter, r *http.Request) {
	id := getID(r)

	activeSessions, err := h.sessionsRepo.ActiveByConnection(id)
	if err != nil {
		WriteError(w, r, CodeInternal, "failed to check active sessions", nil, http.StatusInternalServerError)
		return
	}
	if len(activeSessions) > 0 {
		sessionIDs := make([]string, len(activeSessions))
		for i, s := range activeSessions {
			sessionIDs[i] = s.ID
		}
		WriteError(w, r, CodeConflictRunningSession, "cannot delete: active sync sessions exist",
			map[string]interface{}{"active_sessions": sessionIDs}, http.StatusConflict)
		return
	}

	profiles, err := h.profilesRepo.ByConnection(id)
	if err != nil {
		WriteError(w, r, CodeInternal, "failed to check profiles", nil, http.StatusInternalServerError)
		return
	}
	if len(profiles) > 0 {
		if r.URL.Query().Get("cascade") != "true" {
			profileIDs := make([]string, len(profiles))
			for i, p := range profiles {
				profileIDs[i] = p.ID
			}
			WriteError(w, r, CodeConflictReferenced, "cannot delete: profiles reference this connection",
				map[string]interface{}{"profiles": profileIDs}, http.StatusConflict)
			return
		}
		if err := repo.ExecTx(h.profilesRepo.DB(), func(tx *sql.Tx) error {
			for _, p := range profiles {
				if _, err := tx.Exec("DELETE FROM mapping_profiles WHERE id=?", p.ID); err != nil {
					return err
				}
			}
			_, err := tx.Exec("DELETE FROM connections WHERE id=?", id)
			return err
		}); err != nil {
			WriteError(w, r, CodeInternal, "failed to delete connection with profiles", nil, http.StatusInternalServerError)
			return
		}
		w.WriteHeader(http.StatusNoContent)
		return
	}

	if err := h.repo.Delete(id); err != nil {
		WriteError(w, r, CodeInternal, "failed to delete connection", nil, http.StatusInternalServerError)
		return
	}
	w.WriteHeader(http.StatusNoContent)
}