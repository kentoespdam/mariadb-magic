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
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	hasConnections := len(conns) >= 2

	profiles, err := h.profilesRepo.List()
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
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
		http.Error(w, err.Error(), http.StatusInternalServerError)
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