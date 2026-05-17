package api

import (
	"net/http"
)

// Delete removes a profile with safety checks.
func (h *ProfilesHandler) Delete(w http.ResponseWriter, r *http.Request) {
	id := getProfileID(r)
	profile, err := h.repo.Get(id)
	if err != nil || profile == nil {
		WriteError(w, r, CodeNotFound, "profile not found", nil, http.StatusNotFound)
		return
	}

	// Safety check: don't delete if there's an active session
	activeSessions, err := h.sessionsRepo.ActiveByProfile(profile.ID)
	if err == nil && len(activeSessions) > 0 && profile.Status == "active" {
		WriteError(w, r, CodeConflict, "cannot delete profile: active session uses this profile", nil, http.StatusConflict)
		return
	}

	if err := h.repo.Delete(id); err != nil {
		WriteError(w, r, CodeInternal, "failed to delete profile", err.Error(), http.StatusInternalServerError)
		return
	}
	w.WriteHeader(http.StatusNoContent)
}
