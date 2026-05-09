package repo

import (
	"database/sql"
	"encoding/json"
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

func (r *MappingProfilesRepo) List() ([]models.MappingProfile, error) {
	rows, err := r.db.Query(`
		SELECT id, name, source_connection_id, destination_connection_id, selection_json, rules_json, status, created_at, updated_at 
		FROM mapping_profiles ORDER BY updated_at DESC`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	return scanMappingProfileRows(rows)
}

func (r *MappingProfilesRepo) Get(id string) (*models.MappingProfile, error) {
	row := r.db.QueryRow(`
		SELECT id, name, source_connection_id, destination_connection_id, selection_json, rules_json, status, created_at, updated_at 
		FROM mapping_profiles WHERE id = ?`, id)

	var mp models.MappingProfile
	var selectionJSON, rulesJSON []byte
	err := row.Scan(&mp.ID, &mp.Name, &mp.SourceConnectionID, &mp.DestinationConnectionID, &selectionJSON, &rulesJSON, &mp.Status, &mp.CreatedAt, &mp.UpdatedAt)
	if err == sql.ErrNoRows {
		return nil, nil
	}
	if err != nil {
		return nil, err
	}
	mp.SelectionJSON = json.RawMessage(selectionJSON)
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
		INSERT INTO mapping_profiles (id, name, source_connection_id, destination_connection_id, selection_json, rules_json, status, created_at, updated_at) 
		VALUES (?, ?, ?, ?, ?, ?, ?, 'draft', ?, ?)`,
		mp.ID, mp.Name, mp.SourceConnectionID, mp.DestinationConnectionID, mp.SelectionJSON, mp.RulesJSON, now, now)
	return err
}

func (r *MappingProfilesRepo) Update(mp *models.MappingProfile) error {
	_, err := r.db.Exec(`
		UPDATE mapping_profiles SET name=?, source_connection_id=?, destination_connection_id=?, selection_json=?, rules_json=?, status=?, updated_at=? 
		WHERE id=?`,
		mp.Name, mp.SourceConnectionID, mp.DestinationConnectionID, mp.SelectionJSON, mp.RulesJSON, mp.Status, mp.UpdatedAt, mp.ID)
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
		var selectionJSON, rulesJSON []byte
		if err := rows.Scan(&mp.ID, &mp.Name, &mp.SourceConnectionID, &mp.DestinationConnectionID, &selectionJSON, &rulesJSON, &mp.Status, &mp.CreatedAt, &mp.UpdatedAt); err != nil {
			return nil, err
		}
		mp.SelectionJSON = json.RawMessage(selectionJSON)
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