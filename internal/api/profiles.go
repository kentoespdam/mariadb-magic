package api

import (
	"database/sql"
	"encoding/json"
	"net/http"
	"strings"

	"magic-mariadb/internal/models"
	"magic-mariadb/internal/repo"
)

type ProfilesHandler struct {
	repo *repo.MappingProfilesRepo
}

func NewProfilesHandler(db *sql.DB) *ProfilesHandler {
	return &ProfilesHandler{repo: repo.NewMappingProfilesRepo(db)}
}

func getProfileID(r *http.Request) string {
	path := strings.TrimPrefix(r.URL.Path, "/api/profiles/")
	return strings.Split(path, "/")[0]
}

func (h *ProfilesHandler) List(w http.ResponseWriter, r *http.Request) {
	profiles, err := h.repo.List()
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	json.NewEncoder(w).Encode(profiles)
}

func (h *ProfilesHandler) Get(w http.ResponseWriter, r *http.Request) {
	id := getProfileID(r)
	profile, err := h.repo.Get(id)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	if profile == nil {
		http.Error(w, "not found", http.StatusNotFound)
		return
	}
	json.NewEncoder(w).Encode(profile)
}

type CreateProfileRequest struct {
	Name                      string   `json:"name"`
	SourceConnectionID      string   `json:"source_connection_id"`
	DestinationConnectionID string `json:"destination_connection_id"`
	Tables                  []string `json:"tables"`
}

func (h *ProfilesHandler) Create(w http.ResponseWriter, r *http.Request) {
	var req CreateProfileRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	selBytes, _ := json.Marshal(req.Tables)
	mp := &models.MappingProfile{
		Name:                      req.Name,
		SourceConnectionID:      req.SourceConnectionID,
		DestinationConnectionID: req.DestinationConnectionID,
		SelectionJSON:        selBytes,
	}
	if err := h.repo.Create(mp); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(mp)
}

func (h *ProfilesHandler) Update(w http.ResponseWriter, r *http.Request) {
	id := getProfileID(r)
	var req CreateProfileRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	selBytes, _ := json.Marshal(req.Tables)
	mp := &models.MappingProfile{
		ID:                      id,
		Name:                  req.Name,
		SourceConnectionID:      req.SourceConnectionID,
		DestinationConnectionID: req.DestinationConnectionID,
		SelectionJSON:        selBytes,
	}
	if err := h.repo.Update(mp); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	json.NewEncoder(w).Encode(mp)
}

func (h *ProfilesHandler) Delete(w http.ResponseWriter, r *http.Request) {
	id := getProfileID(r)
	if err := h.repo.Delete(id); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	w.WriteHeader(http.StatusNoContent)
}