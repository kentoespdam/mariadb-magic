package repo

import (
	"database/sql"
	"encoding/json"
	"time"

	"github.com/google/uuid"
	"magic-mariadb/internal/models"
)

type SyncSession struct {
	ID                  string          `json:"id"`
	ProfileID           string          `json:"profile_id"`
	ProfileSnapshotJSON json.RawMessage `json:"profile_snapshot_json"`
	Status              string          `json:"status"`
	StartedAt           string          `json:"started_at"`
	EndedAt             *string         `json:"ended_at"`
	RowsProcessed       int             `json:"rows_processed"`
	RowsFailed          int             `json:"rows_failed"`
	CurrentTable        *string         `json:"current_table"`
	CreatedAt           string          `json:"created_at"`
	UpdatedAt           string          `json:"updated_at"`
}

type SyncSessionsRepo struct {
	db *sql.DB
}

func NewSyncSessionsRepo(db *sql.DB) *SyncSessionsRepo {
	return &SyncSessionsRepo{db: db}
}

func (r *SyncSessionsRepo) Create(profileID string, profileSnapshot models.MappingProfile) (*SyncSession, error) {
	id := uuid.New().String()
	now := time.Now().UTC().Format(time.RFC3339)
	snapshotJSON, _ := json.Marshal(profileSnapshot)

	_, err := r.db.Exec(`
		INSERT INTO sync_sessions (id, profile_id, profile_snapshot_json, status, started_at, created_at, updated_at)
		VALUES (?, ?, ?, 'running', ?, ?, ?)`,
		id, profileID, snapshotJSON, now, now, now)
	if err != nil {
		return nil, err
	}

	return &SyncSession{
		ID:                  id,
		ProfileID:           profileID,
		ProfileSnapshotJSON: snapshotJSON,
		Status:              "running",
		StartedAt:           now,
		CreatedAt:           now,
		UpdatedAt:           now,
	}, nil
}

func (r *SyncSessionsRepo) Get(id string) (*SyncSession, error) {
	row := r.db.QueryRow(`
		SELECT id, profile_id, profile_snapshot_json, status, started_at, ended_at, rows_processed, rows_failed, current_table, created_at, updated_at
		FROM sync_sessions WHERE id = ?`, id)

	var s SyncSession
	var snapshotJSON, endedAt, currentTable []byte
	err := row.Scan(&s.ID, &s.ProfileID, &snapshotJSON, &s.Status, &s.StartedAt, &endedAt, &s.RowsProcessed, &s.RowsFailed, &currentTable, &s.CreatedAt, &s.UpdatedAt)
	if err == sql.ErrNoRows {
		return nil, nil
	}
	if err != nil {
		return nil, err
	}

	s.ProfileSnapshotJSON = json.RawMessage(snapshotJSON)
	if len(endedAt) > 0 {
		s.EndedAt = stringPtr(string(endedAt))
	}
	if len(currentTable) > 0 {
		s.CurrentTable = stringPtr(string(currentTable))
	}

	return &s, nil
}

func (r *SyncSessionsRepo) ActiveByConnection(connID string) ([]SyncSession, error) {
	rows, err := r.db.Query(`
		SELECT s.id, s.profile_id, s.profile_snapshot_json, s.status, s.started_at, s.ended_at, s.rows_processed, s.rows_failed, s.current_table, s.created_at, s.updated_at
		FROM sync_sessions s
		JOIN mapping_profiles p ON s.profile_id = p.id
		WHERE s.status = 'running'
		AND (p.source_connection_id = ? OR p.destination_connection_id = ?)
		ORDER BY s.created_at DESC`, connID, connID)
	if err != nil {
		return []SyncSession{}, err
	}
	defer rows.Close()

	var sessions []SyncSession = []SyncSession{}
	for rows.Next() {
		var s SyncSession
		var snapshotJSON, endedAt, currentTable []byte
		if err := rows.Scan(&s.ID, &s.ProfileID, &snapshotJSON, &s.Status, &s.StartedAt, &endedAt, &s.RowsProcessed, &s.RowsFailed, &currentTable, &s.CreatedAt, &s.UpdatedAt); err != nil {
			return []SyncSession{}, err
		}
		s.ProfileSnapshotJSON = json.RawMessage(snapshotJSON)
		if len(endedAt) > 0 {
			s.EndedAt = stringPtr(string(endedAt))
		}
		if len(currentTable) > 0 {
			s.CurrentTable = stringPtr(string(currentTable))
		}
		sessions = append(sessions, s)
	}
	return sessions, rows.Err()
}

func (r *SyncSessionsRepo) ActiveByProfile(profileID string) ([]SyncSession, error) {
	rows, err := r.db.Query(`
		SELECT id, profile_id, profile_snapshot_json, status, started_at, ended_at, rows_processed, rows_failed, current_table, created_at, updated_at
		FROM sync_sessions WHERE profile_id = ? AND status = 'running'`, profileID)
	if err != nil {
		return []SyncSession{}, err
	}
	defer rows.Close()

	var sessions []SyncSession = []SyncSession{}
	for rows.Next() {
		var s SyncSession
		var snapshotJSON, endedAt, currentTable []byte
		if err := rows.Scan(&s.ID, &s.ProfileID, &snapshotJSON, &s.Status, &s.StartedAt, &endedAt, &s.RowsProcessed, &s.RowsFailed, &currentTable, &s.CreatedAt, &s.UpdatedAt); err != nil {
			return []SyncSession{}, err
		}
		s.ProfileSnapshotJSON = json.RawMessage(snapshotJSON)
		if len(endedAt) > 0 {
			s.EndedAt = stringPtr(string(endedAt))
		}
		if len(currentTable) > 0 {
			s.CurrentTable = stringPtr(string(currentTable))
		}
		sessions = append(sessions, s)
	}
	return sessions, rows.Err()
}
