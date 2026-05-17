package api

import (
    "encoding/json"
    "net/http"
    "time"
    "magic-mariadb/internal/models"
    "magic-mariadb/internal/sync"
)

type CreateProfileRequest struct {
    Name                    string   `json:"name"`
    SourceConnectionID      string   `json:"source_connection_id"`
    DestinationConnectionID string   `json:"destination_connection_id"`
    Tables                  []string `json:"tables"`
}

type UpdatePairingsRequest struct {
    ColumnPairingsJSON string `json:"column_pairings_json"`
    RulesJSON          string `json:"rules_json"`
}

type UpdatePairingsResponse struct {
    Profile          *models.MappingProfile `json:"profile"`
    DowngradedFrom   string                 `json:"downgraded_from,omitempty"`
}

type MarkReadyRequest struct {
    Status string `json:"status"`
}

type PreviewRuleRequest struct {
    RuleJSON           string `json:"rule_dsl"`
    SourceConnectionID string `json:"source_connection_id"`
    Table              string `json:"table"`
    Column             string `json:"column"`
}

// List returns all mapping profiles.
func (h *ProfilesHandler) List(w http.ResponseWriter, r *http.Request) {
    profiles, err := h.repo.List()
    if err != nil {
        WriteError(w, r, CodeInternal, "failed to list profiles", nil, http.StatusInternalServerError)
        return
    }
    json.NewEncoder(w).Encode(profiles)
}

// Get returns a specific profile.
func (h *ProfilesHandler) Get(w http.ResponseWriter, r *http.Request) {
    id := getProfileID(r)
    profile, err := h.repo.Get(id)
    if err != nil {
        WriteError(w, r, CodeInternal, "failed to get profile", nil, http.StatusInternalServerError)
        return
    }
    if profile == nil {
        WriteError(w, r, CodeNotFound, "not found", nil, http.StatusNotFound)
        return
    }
    json.NewEncoder(w).Encode(profile)
}

// Create creates a new mapping profile.
func (h *ProfilesHandler) Create(w http.ResponseWriter, r *http.Request) {
    var req CreateProfileRequest
    if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
        WriteError(w, r, CodeBadRequest, "invalid request body", nil, http.StatusBadRequest)
        return
    }
    sel := models.TableSelection{Tables: req.Tables}
    if sel.Tables == nil {
        sel.Tables = []string{}
    }
    selBytes, _ := json.Marshal(sel)
    mp := &models.MappingProfile{
        Name:                    req.Name,
        SourceConnectionID:      req.SourceConnectionID,
        DestinationConnectionID: req.DestinationConnectionID,
        SelectionJSON:           selBytes,
    }
    if err := h.repo.Create(mp); err != nil {
        WriteError(w, r, CodeInternal, "failed to create profile", err.Error(), http.StatusInternalServerError)
        return
    }
    w.WriteHeader(http.StatusCreated)
    json.NewEncoder(w).Encode(mp)
}

// Update updates an existing profile.
func (h *ProfilesHandler) Update(w http.ResponseWriter, r *http.Request) {
    id := getProfileID(r)
    var req CreateProfileRequest
    if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
        WriteError(w, r, CodeBadRequest, "invalid request body", nil, http.StatusBadRequest)
        return
    }
    existing, err := h.repo.Get(id)
    if err != nil || existing == nil {
        WriteError(w, r, CodeNotFound, "profile not found", nil, http.StatusNotFound)
        return
    }
    if req.Name != "" {
        existing.Name = req.Name
    }
    if req.SourceConnectionID != "" {
        existing.SourceConnectionID = req.SourceConnectionID
    }
    if req.DestinationConnectionID != "" {
        existing.DestinationConnectionID = req.DestinationConnectionID
    }
    if req.Tables != nil {
        sel := models.TableSelection{Tables: req.Tables}
        selBytes, _ := json.Marshal(sel)
        existing.SelectionJSON = selBytes
    }
    existing.UpdatedAt = time.Now().UTC().Format(time.RFC3339)
    if err := h.repo.Update(existing); err != nil {
        WriteError(w, r, CodeInternal, "failed to update profile", err.Error(), http.StatusInternalServerError)
        return
    }
    json.NewEncoder(w).Encode(existing)
}

// Delete removes a profile.
func (h *ProfilesHandler) Delete(w http.ResponseWriter, r *http.Request) {
    id := getProfileID(r)
    if err := h.repo.Delete(id); err != nil {
        WriteError(w, r, CodeInternal, "failed to delete profile", err.Error(), http.StatusInternalServerError)
        return
    }
    w.WriteHeader(http.StatusNoContent)
}

type SchemaResponse struct {
    SourceSchema    map[string]models.TableSchema `json:"source_schema"`
    DestSchema      map[string]models.TableSchema `json:"dest_schema"`
    Tables          []sync.TableWithRole          `json:"tables"`
    AvailableTables []string                      `json:"available_tables"`
}

// GetSchema returns schema info for a profile.
func (h *ProfilesHandler) GetSchema(w http.ResponseWriter, r *http.Request) {
    id := getProfileID(r)
    profile, err := h.repo.Get(id)
    if err != nil || profile == nil {
        WriteError(w, r, CodeNotFound, "not found", nil, http.StatusNotFound)
        return
    }
    mariaSourceSchema, err := h.getMariaDBSchema(profile.SourceConnectionID)
    if err != nil {
        WriteError(w, r, CodeInternal, "failed to get source schema", err.Error(), http.StatusInternalServerError)
        return
    }
    mariaDestSchema, err := h.getMariaDBSchema(profile.DestinationConnectionID)
    if err != nil {
        WriteError(w, r, CodeInternal, "failed to get dest schema", err.Error(), http.StatusInternalServerError)
        return
    }
    ca := sync.NewClosureAdvisor()
    tables, err := ca.ExpandFromSelection(profile.SelectionJSON, mariaSourceSchema, mariaDestSchema)
    if err != nil {
        WriteError(w, r, CodeInternal, "failed to expand closure", err.Error(), http.StatusInternalServerError)
        return
    }
    available := make([]string, 0, len(mariaSourceSchema.Tables))
    for _, t := range mariaSourceSchema.Tables {
        available = append(available, t.Name)
    }
    w.Header().Set("Content-Type", "application/json")
    json.NewEncoder(w).Encode(SchemaResponse{
        SourceSchema:    modelSchemaMapFromMaria(mariaSourceSchema),
        DestSchema:      modelSchemaMapFromMaria(mariaDestSchema),
        Tables:          tables,
        AvailableTables: available,
    })
}
