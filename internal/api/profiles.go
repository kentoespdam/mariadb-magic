package api

import (
	"context"
	"database/sql"
	"encoding/json"
	"fmt"
	"net/http"
	"strings"
	"time"

	"magic-mariadb/internal/crypto"
	"magic-mariadb/internal/mariadb"
	"magic-mariadb/internal/models"
	"magic-mariadb/internal/repo"
	"magic-mariadb/internal/rules"
	"magic-mariadb/internal/sync"
	"magic-mariadb/internal/sync/preflight"
	"magic-mariadb/internal/sync/runner"
)

type ProfilesHandler struct {
	repo          *repo.MappingProfilesRepo
	crypto        crypto.KeyProvider
	runner        *runner.Runner
	logsRepo      *repo.SyncLogsRepo
	sessionsRepo  *repo.SyncSessionsRepo
}

func NewProfilesHandler(db *sql.DB, crypto crypto.KeyProvider) *ProfilesHandler {
	sessionsRepo := repo.NewSyncSessionsRepo(db)
	logsRepo := repo.NewSyncLogsRepo(db)
	r := runner.New(sessionsRepo, logsRepo, 5000)
	return &ProfilesHandler{
		repo:         repo.NewMappingProfilesRepo(db),
		crypto:       crypto,
		runner:       r,
		logsRepo:     logsRepo,
		sessionsRepo: sessionsRepo,
	}
}

func (h *ProfilesHandler) ListSessions(w http.ResponseWriter, r *http.Request) {
	sessions, err := h.runner.ListSessions()
	if err != nil {
		WriteError(w, r, CodeInternal, "failed to list sessions", nil, http.StatusInternalServerError)
		return
	}
	json.NewEncoder(w).Encode(sessions)
}

func (h *ProfilesHandler) GetSession(w http.ResponseWriter, r *http.Request, id string) {
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

func (h *ProfilesHandler) StartSession(w http.ResponseWriter, r *http.Request) {
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

func (h *ProfilesHandler) CancelSession(w http.ResponseWriter, r *http.Request, id string) {
	if err := h.runner.Cancel(id); err != nil {
		WriteError(w, r, CodeInternal, "failed to cancel session", nil, http.StatusInternalServerError)
		return
	}
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]string{"status": "cancelled"})
}

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

func getProfileID(r *http.Request) string {
	path := strings.TrimPrefix(r.URL.Path, "/api/profiles/")
	return strings.Split(path, "/")[0]
}

func (h *ProfilesHandler) List(w http.ResponseWriter, r *http.Request) {
	profiles, err := h.repo.List()
	if err != nil {
		WriteError(w, r, CodeInternal, "failed to list profiles", nil, http.StatusInternalServerError)
		return
	}
	json.NewEncoder(w).Encode(profiles)
}

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

func (h *ProfilesHandler) Create(w http.ResponseWriter, r *http.Request) {
	var req CreateProfileRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		WriteError(w, r, CodeBadRequest, "invalid request body", nil, http.StatusBadRequest)
		return
	}

	selBytes, _ := json.Marshal(req.Tables)
	mp := &models.MappingProfile{
		Name:                    req.Name,
		SourceConnectionID:      req.SourceConnectionID,
		DestinationConnectionID: req.DestinationConnectionID,
		SelectionJSON:           selBytes,
	}
	if err := h.repo.Create(mp); err != nil {
		WriteError(w, r, CodeInternal, "failed to create profile", nil, http.StatusInternalServerError)
		return
	}
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(mp)
}

func (h *ProfilesHandler) Update(w http.ResponseWriter, r *http.Request) {
	id := getProfileID(r)
	var req CreateProfileRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		WriteError(w, r, CodeBadRequest, "invalid request body", nil, http.StatusBadRequest)
		return
	}

	selBytes, _ := json.Marshal(req.Tables)
	mp := &models.MappingProfile{
		ID:                      id,
		Name:                    req.Name,
		SourceConnectionID:      req.SourceConnectionID,
		DestinationConnectionID: req.DestinationConnectionID,
		SelectionJSON:           selBytes,
	}
	if err := h.repo.Update(mp); err != nil {
		WriteError(w, r, CodeInternal, "failed to update profile", nil, http.StatusInternalServerError)
		return
	}
	json.NewEncoder(w).Encode(mp)
}

func (h *ProfilesHandler) Delete(w http.ResponseWriter, r *http.Request) {
	id := getProfileID(r)
	if err := h.repo.Delete(id); err != nil {
		WriteError(w, r, CodeInternal, "failed to delete profile", nil, http.StatusInternalServerError)
		return
	}
	w.WriteHeader(http.StatusNoContent)
}

type SchemaResponse struct {
	SourceSchema models.TableSchema   `json:"source_schema"`
	DestSchema   models.TableSchema   `json:"dest_schema"`
	Tables       []sync.TableWithRole `json:"tables"`
}

func (h *ProfilesHandler) GetSchema(w http.ResponseWriter, r *http.Request) {
	id := getProfileID(r)
	profile, err := h.repo.Get(id)
	if err != nil || profile == nil {
		WriteError(w, r, CodeNotFound, "not found", nil, http.StatusNotFound)
		return
	}

	mariaSourceSchema, err := h.getMariaDBSchema(profile.SourceConnectionID)
	if err != nil {
		WriteError(w, r, CodeInternal, "failed to get source schema", nil, http.StatusInternalServerError)
		return
	}

	mariaDestSchema, err := h.getMariaDBSchema(profile.DestinationConnectionID)
	if err != nil {
		WriteError(w, r, CodeInternal, "failed to get dest schema", nil, http.StatusInternalServerError)
		return
	}

	ca := sync.NewClosureAdvisor()
	tables, err := ca.ExpandFromSelection(profile.SelectionJSON, mariaSourceSchema, mariaDestSchema)
	if err != nil {
		WriteError(w, r, CodeInternal, "failed to expand closure", nil, http.StatusInternalServerError)
		return
	}

	json.NewEncoder(w).Encode(SchemaResponse{
		SourceSchema: modelSchemaFromMaria(mariaSourceSchema),
		DestSchema:   modelSchemaFromMaria(mariaDestSchema),
		Tables:       tables,
	})
}

func modelSchemaFromMaria(ms mariadb.Schema) models.TableSchema {
	result := make(models.TableSchema)
	if len(ms.Tables) == 0 {
		return result
	}
	for _, t := range ms.Tables {
		for _, col := range t.Columns {
			result[col.Name] = models.ColumnInfo{
				Name:     col.Name,
				Nullable: col.Nullable,
				Default:  col.Default,
				IsPK:     isPK(col.Name, t.PK),
			}
		}
		break
	}
	return result
}

func modelSchemaMapFromMaria(ms mariadb.Schema) map[string]models.TableSchema {
	result := make(map[string]models.TableSchema)
	for _, t := range ms.Tables {
		schema := make(models.TableSchema)
		for _, col := range t.Columns {
			schema[col.Name] = models.ColumnInfo{
				Name:     col.Name,
				Nullable: col.Nullable,
				Default:  col.Default,
				IsPK:     isPK(col.Name, t.PK),
			}
		}
		result[t.Name] = schema
	}
	return result
}

func (h *ProfilesHandler) getMariaDBSchema(connID string) (mariadb.Schema, error) {
	conn, err := h.repo.GetConnection(connID)
	if err != nil || conn == nil {
		return mariadb.Schema{}, fmt.Errorf("connection not found")
	}

	parts := strings.Split(conn.PasswordCiphertext, ":")
	var password string
	if len(parts) == 2 {
		password, err = h.crypto.Decrypt(parts[0], parts[1])
		if err != nil {
			return mariadb.Schema{}, fmt.Errorf("failed to decrypt password: %w", err)
		}
	} else {
		password, err = h.crypto.Decrypt(conn.PasswordCiphertext, "")
		if err != nil {
			return mariadb.Schema{}, fmt.Errorf("failed to decrypt password: %w", err)
		}
	}

	cfg := mariadb.Config{
		Host:     conn.Host,
		Port:     conn.Port,
		User:     conn.User,
		Password: password,
	}

	db, err := cfg.Connect()
	if err != nil {
		return mariadb.Schema{}, err
	}
	defer db.Close()

	ctx := context.Background()
	schema, err := mariadb.NewIntrospector(db, 30).GetSchema(ctx)
	if err != nil {
		return mariadb.Schema{}, err
	}

	return schema, nil
}

func toModelTableSchemaMap(ts []mariadb.TableSchema) map[string]models.TableSchema {
	result := make(map[string]models.TableSchema)
	for _, table := range ts {
		schema := make(models.TableSchema)
		for _, col := range table.Columns {
			schema[col.Name] = models.ColumnInfo{
				Name:     col.Name,
				Nullable: col.Nullable,
				Default:  col.Default,
				IsPK:     isPK(col.Name, table.PK),
			}
		}
		result[table.Name] = schema
	}
	return result
}

func isPK(colName string, pk []string) bool {
	for _, p := range pk {
		if p == colName {
			return true
		}
	}
	return false
}

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
		WriteError(w, r, CodeInternal, "failed to update pairings", nil, http.StatusInternalServerError)
		return
	}

	downgradedFrom := ""
	if prevStatus == "ready" {
		downgradedFrom = "ready"
	} else if prevStatus == "active" {
		downgradedFrom = "active"
	}

	json.NewEncoder(w).Encode(UpdatePairingsResponse{
		Profile:        profile,
		DowngradedFrom: downgradedFrom,
	})
}

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
			WriteError(w, r, CodeBadRequest, "invalid pairings", nil, http.StatusBadRequest)
			return
		}
	}

	var rulesMap map[string][]string
	if len(profile.RulesJSON) > 0 {
		json.Unmarshal(profile.RulesJSON, &rulesMap)
	}

	mariaDestSchema, err := h.getMariaDBSchema(profile.DestinationConnectionID)
	if err != nil {
		WriteError(w, r, CodeInternal, "failed to get dest schema", nil, http.StatusInternalServerError)
		return
	}

	destSchema := modelSchemaMapFromMaria(mariaDestSchema)
	result := repo.ValidateProfileForReady(mappings, rulesMap, destSchema)
	if !result.Valid {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(map[string]interface{}{
			"valid":  false,
			"errors": result.Errors,
		})
		return
	}

	var selection models.TableSelection
	json.Unmarshal(profile.SelectionJSON, &selection)

	ca := sync.NewClosureAdvisor()
	expanded, err := ca.Expand(selection.Tables, mariadb.Schema{}, mariadb.Schema{})
	if err != nil {
		WriteError(w, r, CodeInternal, "failed to expand selection", nil, http.StatusInternalServerError)
		return
	}

	var tables []string
	for _, t := range expanded {
		if t.Role == "child" || t.Role == "root" {
			tables = append(tables, t.Name)
		}
	}

	conflicts, err := h.repo.HasCollision(profile.ID, profile.DestinationConnectionID, tables)
	if err != nil {
		WriteError(w, r, CodeInternal, "failed to check collision", nil, http.StatusInternalServerError)
		return
	}
	if len(conflicts) > 0 {
		w.WriteHeader(http.StatusConflict)
		json.NewEncoder(w).Encode(map[string]interface{}{
			"valid":          false,
			"error_friendly": repo.ToFriendlyCollision(conflicts),
			"conflicts":      conflicts,
		})
		return
	}

	profile.Status = "ready"
	profile.UpdatedAt = time.Now().UTC().Format(time.RFC3339)
	if err := h.repo.Update(profile); err != nil {
		WriteError(w, r, CodeInternal, "failed to update profile", nil, http.StatusInternalServerError)
		return
	}

	json.NewEncoder(w).Encode(profile)
}

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

type PreviewRuleRequest struct {
	RuleJSON           string `json:"rule_dsl"`
	SourceConnectionID string `json:"source_connection_id"`
	Table              string `json:"table"`
	Column             string `json:"column"`
}

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

	password, err := h.crypto.Decrypt(conn.PasswordCiphertext, "")
	if err != nil {
		WriteError(w, r, CodeInternal, "failed to decrypt password", nil, http.StatusInternalServerError)
		return
	}

	cfg := mariadb.Config{
		Host:     conn.Host,
		Port:     conn.Port,
		User:     conn.User,
		Password: password,
	}
	db, err := cfg.Connect()
	if err != nil {
		WriteError(w, r, CodeInternal, "failed to connect", err.Error(), http.StatusInternalServerError)
		return
	}
	defer db.Close()

	query := fmt.Sprintf("SELECT DISTINCT %s FROM %s WHERE %s IS NOT NULL LIMIT 5",
		req.Column, req.Table, req.Column)
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

	srcPwd, _ := h.crypto.Decrypt(srcConn.PasswordCiphertext, "")
	destPwd, _ := h.crypto.Decrypt(destConn.PasswordCiphertext, "")

	cfg := mariadb.Config{Host: srcConn.Host, Port: srcConn.Port, User: srcConn.User, Password: srcPwd}
	srcDB, err := cfg.Connect()
	if err != nil {
		WriteError(w, r, CodeInternal, "failed to connect source", nil, http.StatusInternalServerError)
		return
	}
	defer srcDB.Close()

	destCfg := mariadb.Config{Host: destConn.Host, Port: destConn.Port, User: destConn.User, Password: destPwd}
	destDB, err := destCfg.Connect()
	if err != nil {
		WriteError(w, r, CodeInternal, "failed to connect destination", nil, http.StatusInternalServerError)
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
