package api

import (
	"database/sql"
	"encoding/json"
	"net/http"

	"magic-mariadb/internal/repo"
)

type OnboardingHandler struct {
	connectionsRepo *repo.ConnectionsRepo
	profilesRepo    *repo.MappingProfilesRepo
	sessionsRepo    *repo.SyncSessionsRepo
}

func NewOnboardingHandler(db *sql.DB) *OnboardingHandler {
	return &OnboardingHandler{
		connectionsRepo: repo.NewConnectionsRepo(db),
		profilesRepo:    repo.NewMappingProfilesRepo(db),
		sessionsRepo:    repo.NewSyncSessionsRepo(db),
	}
}

type OnboardingState struct {
	HasConnections  bool `json:"has_connections"`
	HasReadyProfile bool `json:"has_ready_profile"`
	HasAnySession   bool `json:"has_any_session"`
	ReadyProfiles   int  `json:"ready_profiles"`
	SessionsCount   int  `json:"sessions_count"`
}

func (h *OnboardingHandler) GetState(w http.ResponseWriter, r *http.Request) {
	conns, err := h.connectionsRepo.List()
	if err != nil {
		WriteError(w, r, CodeInternal, "failed to list connections", nil, http.StatusInternalServerError)
		return
	}

	hasConnections := len(conns) >= 1

	profiles, err := h.profilesRepo.List()
	if err != nil {
		WriteError(w, r, CodeInternal, "failed to list profiles", nil, http.StatusInternalServerError)
		return
	}
	readyCount := 0
	for _, p := range profiles {
		if p.Status == "ready" {
			readyCount++
		}
	}
	hasReadyProfile := readyCount > 0

	sessions, err := h.sessionsRepo.List()
	if err != nil {
		WriteError(w, r, CodeInternal, "failed to list sessions", nil, http.StatusInternalServerError)
		return
	}
	hasAnySession := len(sessions) > 0

	state := OnboardingState{
		HasConnections:  hasConnections,
		HasReadyProfile: hasReadyProfile,
		HasAnySession:   hasAnySession,
		ReadyProfiles:   readyCount,
		SessionsCount:   len(sessions),
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(state)
}
