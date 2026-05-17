package api

import (
    "encoding/json"
    "net/http"
    "fmt"
    "time"
    "magic-mariadb/internal/models"
    "magic-mariadb/internal/repo"
    "magic-mariadb/internal/rules"
    "magic-mariadb/internal/mariadb"
    "magic-mariadb/internal/sync"
    "magic-mariadb/internal/sync/preflight"
)

// UpdatePairings updates column pairings and rules for a profile.
func (h *ProfilesHandler) UpdatePairings(w http.ResponseWriter, r *http.Request) {
    id := getProfileID(r)
    var req UpdatePairingsRequest
    if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
        WriteError(w, r, CodeBadRequest, "invalid request body", nil, http.StatusBadRequest)
        return
    }
    profile, err := h.repo.Get(id)
    if err != nil || profile == nil {
        WriteError(w, r, CodeNotFound, "not found", nil, http.StatusNotFound)
        return
    }
    prevStatus := profile.Status
    activeSessions, err := h.sessionsRepo.ActiveByProfile(profile.ID)
    if err == nil && len(activeSessions) > 0 && prevStatus == "active" {
        WriteError(w, r, CodeConflict, "cannot update pairings: active session uses this profile", nil, http.StatusConflict)
        return
    }
    if prevStatus == "ready" || prevStatus == "active" {
        profile.Status = "draft"
    }
    profile.ColumnPairingsJSON = json.RawMessage(req.ColumnPairingsJSON)
    profile.RulesJSON = json.RawMessage(req.RulesJSON)
    profile.UpdatedAt = time.Now().UTC().Format(time.RFC3339)
    if err := h.repo.Update(profile); err != nil {
        WriteError(w, r, CodeInternal, "failed to update pairings", err.Error(), http.StatusInternalServerError)
        return
    }
    downgradedFrom := ""
    if prevStatus == "ready" {
        downgradedFrom = "ready"
    } else if prevStatus == "active" {
        downgradedFrom = "active"
    }
    json.NewEncoder(w).Encode(UpdatePairingsResponse{Profile: profile, DowngradedFrom: downgradedFrom})
}

// MarkReady transitions a profile to ready state after validation.
func (h *ProfilesHandler) MarkReady(w http.ResponseWriter, r *http.Request) {
    id := getProfileID(r)
    var req struct {
        ColumnPairingsJSON string `json:"column_pairings_json"`
        RulesJSON          string `json:"rules_json"`
    }
    if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
        WriteError(w, r, CodeBadRequest, "invalid request body", nil, http.StatusBadRequest)
        return
    }
    profile, err := h.repo.Get(id)
    if err != nil || profile == nil {
        WriteError(w, r, CodeNotFound, "not found", nil, http.StatusNotFound)
        return
    }
    if req.ColumnPairingsJSON != "" {
        profile.ColumnPairingsJSON = json.RawMessage(req.ColumnPairingsJSON)
    }
    if req.RulesJSON != "" {
        profile.RulesJSON = json.RawMessage(req.RulesJSON)
    }
    var mappings models.ProfileMappings
    if len(profile.ColumnPairingsJSON) > 0 {
        if err := json.Unmarshal(profile.ColumnPairingsJSON, &mappings); err != nil {
            WriteError(w, r, CodeBadRequest, "invalid pairings", err.Error(), http.StatusBadRequest)
            return
        }
    }
    var rulesMap map[string][]string
    if len(profile.RulesJSON) > 0 {
        var ruleStore rules.RuleStore
        if err := json.Unmarshal(profile.RulesJSON, &ruleStore); err == nil {
            rulesMap = make(map[string][]string)
            for table, cols := range ruleStore {
                var colNames []string
                for col := range cols {
                    colNames = append(colNames, col)
                }
                rulesMap[table] = colNames
            }
        }
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
    destSchema := modelSchemaMapFromMaria(mariaDestSchema)
    result := repo.ValidateProfileForReady(mappings, rulesMap, destSchema)
    if !result.Valid {
        w.WriteHeader(http.StatusBadRequest)
        json.NewEncoder(w).Encode(map[string]interface{}{"valid": false, "errors": result.Errors})
        return
    }
    var selection models.TableSelection
    json.Unmarshal(profile.SelectionJSON, &selection)
    ca := sync.NewClosureAdvisor()
    expanded, err := ca.Expand(selection.Tables, mariaSourceSchema, mariaDestSchema)
    if err != nil {
        WriteError(w, r, CodeInternal, "failed to expand selection", err.Error(), http.StatusInternalServerError)
        return
    }
    var tables []string
    for _, t := range expanded {
        tables = append(tables, t.Name)
    }
    conflicts, err := h.repo.HasCollision(profile.ID, profile.DestinationConnectionID, tables)
    if err != nil {
        WriteError(w, r, CodeInternal, "failed to check collision", err.Error(), http.StatusInternalServerError)
        return
    }
    if len(conflicts) > 0 {
        w.WriteHeader(http.StatusConflict)
        json.NewEncoder(w).Encode(map[string]interface{}{"valid": false, "error_friendly": repo.ToFriendlyCollision(conflicts), "conflicts": conflicts})
        return
    }
    profile.Status = "ready"
    profile.UpdatedAt = time.Now().UTC().Format(time.RFC3339)
    if err := h.repo.Update(profile); err != nil {
        WriteError(w, r, CodeInternal, "failed to update profile", err.Error(), http.StatusInternalServerError)
        return
    }
    json.NewEncoder(w).Encode(profile)
}

// DowngradeToDraft reverts a profile back to draft status.
func (h *ProfilesHandler) DowngradeToDraft(w http.ResponseWriter, r *http.Request) {
    id := getProfileID(r)
    profile, err := h.repo.Get(id)
    if err != nil || profile == nil {
        WriteError(w, r, CodeNotFound, "not found", nil, http.StatusNotFound)
        return
    }
    var req struct {
        ColumnPairingsJSON string `json:"column_pairings_json"`
        RulesJSON          string `json:"rules_json"`
    }
    json.NewDecoder(r.Body).Decode(&req)
    if req.ColumnPairingsJSON != "" {
        profile.ColumnPairingsJSON = json.RawMessage(req.ColumnPairingsJSON)
    }
    if req.RulesJSON != "" {
        profile.RulesJSON = json.RawMessage(req.RulesJSON)
    }
    profile.Status = "draft"
    profile.UpdatedAt = time.Now().UTC().Format(time.RFC3339)
    h.repo.Update(profile)
    json.NewEncoder(w).Encode(profile)
}

// PreviewRule runs a rule preview.
func (h *ProfilesHandler) PreviewRule(w http.ResponseWriter, r *http.Request) {
    var req PreviewRuleRequest
    if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
        WriteError(w, r, CodeBadRequest, "invalid request body", nil, http.StatusBadRequest)
        return
    }
    var rule rules.Rule
    if err := json.Unmarshal([]byte(req.RuleJSON), &rule); err != nil {
        WriteError(w, r, CodeBadRequest, "invalid rule JSON", nil, http.StatusBadRequest)
        return
    }
    if err := rules.Validate(rule); err != nil {
        WriteError(w, r, CodeBadRequest, err.Error(), nil, http.StatusBadRequest)
        return
    }
    conn, err := h.repo.GetConnection(req.SourceConnectionID)
    if err != nil || conn == nil {
        WriteError(w, r, CodeNotFound, "connection not found", nil, http.StatusNotFound)
        return
    }
    password, err := h.decryptPassword(conn.PasswordCiphertext)
    if err != nil {
        WriteError(w, r, CodeInternal, "failed to decrypt password", err.Error(), http.StatusInternalServerError)
        return
    }
    cfg := mariadb.Config{Host: conn.Host, Port: conn.Port, User: conn.User, Password: password}
    db, err := cfg.Connect()
    if err != nil {
        WriteError(w, r, CodeInternal, "failed to connect", err.Error(), http.StatusInternalServerError)
        return
    }
    defer db.Close()
    query := fmt.Sprintf("SELECT DISTINCT %s FROM %s WHERE %s IS NOT NULL LIMIT 5", req.Column, req.Table, req.Column)
    rows, err := db.Query(query)
    if err != nil {
        WriteError(w, r, CodeInternal, "failed to query", err.Error(), http.StatusInternalServerError)
        return
    }
    defer rows.Close()
    var values []any
    for rows.Next() {
        var val any
        if err := rows.Scan(&val); err != nil {
            continue
        }
        values = append(values, val)
    }
    results := rules.ValidatePreview(rule, values)
    json.NewEncoder(w).Encode(results)
}

// Preflight runs preflight checks.
func (h *ProfilesHandler) Preflight(w http.ResponseWriter, r *http.Request) {
    id := getProfileID(r)
    profile, err := h.repo.Get(id)
    if err != nil || profile == nil {
        WriteError(w, r, CodeNotFound, "profile not found", nil, http.StatusNotFound)
        return
    }
    srcConn, err := h.repo.GetConnection(profile.SourceConnectionID)
    if err != nil || srcConn == nil {
        WriteError(w, r, CodeNotFound, "source connection not found", nil, http.StatusNotFound)
        return
    }
    destConn, err := h.repo.GetConnection(profile.DestinationConnectionID)
    if err != nil || destConn == nil {
        WriteError(w, r, CodeNotFound, "destination connection not found", nil, http.StatusNotFound)
        return
    }
    srcPwd, err := h.decryptPassword(srcConn.PasswordCiphertext)
    if err != nil {
        WriteError(w, r, CodeInternal, "failed to decrypt source password", err.Error(), http.StatusInternalServerError)
        return
    }
    destPwd, err := h.decryptPassword(destConn.PasswordCiphertext)
    if err != nil {
        WriteError(w, r, CodeInternal, "failed to decrypt destination password", err.Error(), http.StatusInternalServerError)
        return
    }
    srcCfg := mariadb.Config{Host: srcConn.Host, Port: srcConn.Port, User: srcConn.User, Password: srcPwd, DBName: srcConn.Database}
    srcDB, err := srcCfg.Connect()
    if err != nil {
        WriteError(w, r, CodeInternal, "failed to connect source", err.Error(), http.StatusInternalServerError)
        return
    }
    defer srcDB.Close()
    destCfg := mariadb.Config{Host: destConn.Host, Port: destConn.Port, User: destConn.User, Password: destPwd, DBName: destConn.Database}
    destDB, err := destCfg.Connect()
    if err != nil {
        WriteError(w, r, CodeInternal, "failed to connect destination", err.Error(), http.StatusInternalServerError)
        return
    }
    defer destDB.Close()
    report, err := preflight.Preflight(r.Context(), *profile, srcDB, destDB)
    if err != nil {
        WriteError(w, r, CodeInternal, "preflight failed", err.Error(), http.StatusInternalServerError)
        return
    }
    w.Header().Set("Content-Type", "application/json")
    json.NewEncoder(w).Encode(report)
}
