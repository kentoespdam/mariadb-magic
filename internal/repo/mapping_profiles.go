package repo

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"strings"
	"time"

	"github.com/google/uuid"
	"magic-mariadb/internal/models"
)

type MappingProfilesRepo struct {
	db *sql.DB
}

func NewMappingProfilesRepo(db *sql.DB) *MappingProfilesRepo {
	return &MappingProfilesRepo{db: db}
}

func (r *MappingProfilesRepo) GetConnection(id string) (*Connection, error) {
	row := r.db.QueryRow(`
		SELECT id, name, host, port, user, password_ciphertext, last_test_at, last_test_status, last_test_error_friendly, created_at, updated_at 
		FROM connections WHERE id = ?`, id)
	var c Connection
	var lastTestAt, lastTestStatus, lastTestError []byte
	err := row.Scan(&c.ID, &c.Name, &c.Host, &c.Port, &c.User, &c.PasswordCiphertext, &lastTestAt, &lastTestStatus, &lastTestError, &c.CreatedAt, &c.UpdatedAt)
	if err == sql.ErrNoRows {
		return nil, nil
	}
	if err != nil {
		return nil, err
	}
	if len(lastTestStatus) > 0 {
		str := string(lastTestStatus)
		c.LastTestStatus = &str
	}
	return &c, nil
}

func (r *MappingProfilesRepo) List() ([]models.MappingProfile, error) {
	rows, err := r.db.Query(`
		SELECT id, name, source_connection_id, destination_connection_id, selection_json, column_pairings_json, rules_json, status, created_at, updated_at
		FROM mapping_profiles ORDER BY updated_at DESC`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	return scanMappingProfileRows(rows)
}

func (r *MappingProfilesRepo) Get(id string) (*models.MappingProfile, error) {
	row := r.db.QueryRow(`
		SELECT id, name, source_connection_id, destination_connection_id, selection_json, column_pairings_json, rules_json, status, created_at, updated_at
		FROM mapping_profiles WHERE id = ?`, id)

	var mp models.MappingProfile
	var selectionJSON, pairingsJSON, rulesJSON []byte
	err := row.Scan(&mp.ID, &mp.Name, &mp.SourceConnectionID, &mp.DestinationConnectionID, &selectionJSON, &pairingsJSON, &rulesJSON, &mp.Status, &mp.CreatedAt, &mp.UpdatedAt)
	if err == sql.ErrNoRows {
		return nil, nil
	}
	if err != nil {
		return nil, err
	}
	mp.SelectionJSON = json.RawMessage(selectionJSON)
	mp.ColumnPairingsJSON = json.RawMessage(pairingsJSON)
	mp.RulesJSON = json.RawMessage(rulesJSON)
	return &mp, nil
}

func (r *MappingProfilesRepo) Create(mp *models.MappingProfile) error {
	if mp.ID == "" {
		mp.ID = uuid.New().String()
	}
	now := time.Now().UTC().Format(time.RFC3339)
	mp.CreatedAt = now
	mp.UpdatedAt = now
	mp.Status = "draft"
	_, err := r.db.Exec(`
		INSERT INTO mapping_profiles (id, name, source_connection_id, destination_connection_id, selection_json, column_pairings_json, rules_json, status, created_at, updated_at)
		VALUES (?, ?, ?, ?, ?, ?, ?, 'draft', ?, ?)`,
		mp.ID, mp.Name, mp.SourceConnectionID, mp.DestinationConnectionID, mp.SelectionJSON, mp.ColumnPairingsJSON, mp.RulesJSON, now, now)
	return err
}

func (r *MappingProfilesRepo) Update(mp *models.MappingProfile) error {
	_, err := r.db.Exec(`
		UPDATE mapping_profiles SET name=?, source_connection_id=?, destination_connection_id=?, selection_json=?, column_pairings_json=?, rules_json=?, status=?, updated_at=?
		WHERE id=?`,
		mp.Name, mp.SourceConnectionID, mp.DestinationConnectionID, mp.SelectionJSON, mp.ColumnPairingsJSON, mp.RulesJSON, mp.Status, mp.UpdatedAt, mp.ID)
	return err
}

func (r *MappingProfilesRepo) Delete(id string) error {
	_, err := r.db.Exec("DELETE FROM mapping_profiles WHERE id=?", id)
	return err
}

func scanMappingProfileRows(rows *sql.Rows) ([]models.MappingProfile, error) {
	var profiles []models.MappingProfile
	for rows.Next() {
		var mp models.MappingProfile
		var selectionJSON, pairingsJSON, rulesJSON []byte
		if err := rows.Scan(&mp.ID, &mp.Name, &mp.SourceConnectionID, &mp.DestinationConnectionID, &selectionJSON, &pairingsJSON, &rulesJSON, &mp.Status, &mp.CreatedAt, &mp.UpdatedAt); err != nil {
			return nil, err
		}
		mp.SelectionJSON = json.RawMessage(selectionJSON)
		mp.ColumnPairingsJSON = json.RawMessage(pairingsJSON)
		mp.RulesJSON = json.RawMessage(rulesJSON)
		profiles = append(profiles, mp)
	}
	return profiles, rows.Err()
}

func (r *MappingProfilesRepo) GetByStatus(status string) (int, error) {
	var count int
	err := r.db.QueryRow("SELECT COUNT(*) FROM mapping_profiles WHERE status = ?", status).Scan(&count)
	return count, err
}

type ValidationError struct {
	Table   string
	Column  string
	Message string
}

func (v ValidationError) Error() string {
	return v.Message
}

type ValidationResult struct {
	Valid  bool
	Errors []ValidationError
}

func ValidateProfileForReady(mappings models.ProfileMappings, rules map[string][]string, destSchema map[string]models.TableSchema) ValidationResult {
	var errors []ValidationError

	for _, tm := range mappings.Tables {
		tableSchema, ok := destSchema[tm.TableName]
		if !ok {
			continue
		}

		tableRules := rules[tm.TableName]

		for _, cp := range tm.ColumnPairs {
			colInfo, colExists := tableSchema[cp.DestColumn]
			if !colExists {
				continue
			}

			hasRule := false
			for _, ruleCol := range tableRules {
				if ruleCol == cp.DestColumn {
					hasRule = true
					break
				}
			}

			if colInfo.IsPK {
				if cp.SourceType != models.SourceTypeColumn {
					errors = append(errors, ValidationError{
						Table:   tm.TableName,
						Column:  cp.DestColumn,
						Message: "PK wajib di-pair ke Source Column",
					})
				}
				if hasRule {
					errors = append(errors, ValidationError{
						Table:   tm.TableName,
						Column:  cp.DestColumn,
						Message: "PK tidak boleh punya Rule",
					})
				}
			}

			if !colInfo.Nullable {
				if colInfo.Default == nil {
					if cp.SourceType == models.SourceTypeNull || cp.SourceType == models.SourceTypeSkip {
						errors = append(errors, ValidationError{
							Table:   tm.TableName,
							Column:  cp.DestColumn,
							Message: "Kolom NOT NULL tanpa default tidak boleh Kosongkan/NULL atau Lewati",
						})
					}
				} else {
					if cp.SourceType == models.SourceTypeNull {
						errors = append(errors, ValidationError{
							Table:   tm.TableName,
							Column:  cp.DestColumn,
							Message: "Kolom NOT NULL tidak boleh diset NULL",
						})
					}
				}
			}
		}
	}

	return ValidationResult{
		Valid:  len(errors) == 0,
		Errors: errors,
	}
}

type Conflict struct {
	Table       string `json:"table"`
	ProfileID   string `json:"profile_id"`
	ProfileName string `json:"profile_name"`
}

func (r *MappingProfilesRepo) HasCollision(profileID, destID string, tables []string) ([]Conflict, error) {
	if len(tables) == 0 {
		return nil, nil
	}

	rows, err := r.db.Query(`
		SELECT id, name, selection_json 
		FROM mapping_profiles 
		WHERE status = 'ready' 
		AND destination_connection_id = ? 
		AND id != ?`, destID, profileID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var conflicts []Conflict
	for rows.Next() {
		var id, name string
		var selectionJSON []byte
		if err := rows.Scan(&id, &name, &selectionJSON); err != nil {
			continue
		}

		var selection models.TableSelection
		if err := json.Unmarshal(selectionJSON, &selection); err != nil {
			continue
		}

		profileTables := make(map[string]bool)
		for _, t := range selection.Tables {
			profileTables[t] = true
		}

		for _, t := range tables {
			if profileTables[t] {
				conflicts = append(conflicts, Conflict{
					Table:       t,
					ProfileID:   id,
					ProfileName: name,
				})
			}
		}
	}
	return conflicts, rows.Err()
}

func ToFriendlyCollision(conflicts []Conflict) string {
	if len(conflicts) == 0 {
		return ""
	}
	if len(conflicts) == 1 {
		return conflictStr(conflicts[0])
	}
	var msg string
	byTable := make(map[string][]Conflict)
	for _, c := range conflicts {
		byTable[c.Table] = append(byTable[c.Table], c)
	}
	first := true
	for _, cs := range byTable {
		if !first {
			msg += ". "
		}
		first = false
		profileNames := make(map[string]bool)
		var names []string
		for _, c := range cs {
			if !profileNames[c.ProfileName] {
				profileNames[c.ProfileName] = true
				names = append(names, c.ProfileName)
			}
		}
		msg += fmt.Sprintf("Tabel %s sudah dipakai profile %s", cs[0].Table, strings.Join(names, ", "))
	}
	return msg
}

func conflictStr(c Conflict) string {
	return fmt.Sprintf("Tabel %s sudah dipakai profile \"%s\". Dua profile tidak boleh menulis ke tabel Destination yang sama.", c.Table, c.ProfileName)
}
