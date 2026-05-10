package repo

import (
	"context"
	"database/sql"
	"encoding/json"
	"time"

	"magic-mariadb/internal/models"
)

func (r *SyncSessionsRepo) Count() (int, error) {
	var count int
	err := r.db.QueryRow("SELECT COUNT(*) FROM sync_sessions").Scan(&count)
	return count, err
}

func (r *SyncSessionsRepo) EvictOldest(ctx context.Context, limit int) error {
	tx, err := r.db.BeginTx(ctx, nil)
	if err != nil {
		return err
	}
	defer tx.Rollback()

	_, err = tx.ExecContext(ctx, `
		DELETE FROM sync_sessions WHERE id IN (
			SELECT id FROM sync_sessions ORDER BY created_at ASC LIMIT ?
		)`, limit)
	if err != nil {
		return err
	}

	return tx.Commit()
}

func (r *SyncSessionsRepo) List() ([]SyncSession, error) {
	rows, err := r.db.Query(`
		SELECT id, profile_id, profile_snapshot_json, status, started_at, ended_at, rows_processed, rows_failed, current_table, created_at, updated_at
		FROM sync_sessions ORDER BY created_at DESC`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var sessions []SyncSession
	for rows.Next() {
		var s SyncSession
		var snapshotJSON, endedAt, currentTable []byte
		if err := rows.Scan(&s.ID, &s.ProfileID, &snapshotJSON, &s.Status, &s.StartedAt, &endedAt, &s.RowsProcessed, &s.RowsFailed, &currentTable, &s.CreatedAt, &s.UpdatedAt); err != nil {
			return nil, err
		}
		s.ProfileSnapshotJSON = snapshotJSON
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

func (r *SyncSessionsRepo) AnyRunning() (bool, string, string, error) {
	row := r.db.QueryRow(`
		SELECT s.id, p.name FROM sync_sessions s
		JOIN mapping_profiles p ON s.profile_id = p.id
		WHERE s.status = 'running' LIMIT 1`)

	var sessionID, profileName string
	err := row.Scan(&sessionID, &profileName)
	if err == sql.ErrNoRows {
		return false, "", "", nil
	}
	if err != nil {
		return false, "", "", err
	}
	return true, sessionID, profileName, nil
}

func (r *SyncSessionsRepo) UpdateStatus(id, status string) error {
	now := time.Now().UTC().Format(time.RFC3339)
	var endedAt *string
	if status != "running" {
		endedAt = &now
	}
	_, err := r.db.Exec(`
		UPDATE sync_sessions SET status = ?, ended_at = ?, updated_at = ? WHERE id = ?`,
		status, endedAt, now, id)
	return err
}

func (r *SyncSessionsRepo) UpdateProgress(id, currentTable string, rowsProcessed, rowsFailed int) error {
	now := time.Now().UTC().Format(time.RFC3339)
	_, err := r.db.Exec(`
		UPDATE sync_sessions SET current_table = ?, rows_processed = ?, rows_failed = ?, updated_at = ? WHERE id = ?`,
		currentTable, rowsProcessed, rowsFailed, now, id)
	return err
}

func (r *SyncSessionsRepo) GetProfileSnapshot(profileID string) (models.MappingProfile, error) {
	var profile models.MappingProfile
	row := r.db.QueryRow(`
		SELECT id, name, source_connection_id, destination_connection_id, selection_json, column_pairings_json, rules_json, status, created_at, updated_at
		FROM mapping_profiles WHERE id = ?`, profileID)

	var selectionJSON, pairingsJSON, rulesJSON []byte
	err := row.Scan(&profile.ID, &profile.Name, &profile.SourceConnectionID, &profile.DestinationConnectionID, &selectionJSON, &pairingsJSON, &rulesJSON, &profile.Status, &profile.CreatedAt, &profile.UpdatedAt)
	if err != nil {
		return profile, err
	}
	profile.SelectionJSON = json.RawMessage(selectionJSON)
	profile.ColumnPairingsJSON = json.RawMessage(pairingsJSON)
	profile.RulesJSON = json.RawMessage(rulesJSON)
	return profile, nil
}

func (r *SyncSessionsRepo) GetConnection(id string) (*Connection, error) {
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
