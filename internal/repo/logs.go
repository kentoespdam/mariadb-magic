package repo

import (
	"database/sql"
	"encoding/json"
	"time"

	"github.com/google/uuid"
)

type SyncLog struct {
	ID              string `json:"id"`
	SessionID       string `json:"session_id"`
	DestinationTable string `json:"destination_table"`
	PKJSON          *string `json:"pk_json"`
	ProblemColumn  *string `json:"problem_column"`
	SourceValue    *string `json:"source_value"`
	MariaDBCode    int     `json:"mariadb_code"`
	TechnicalMsg   *string `json:"technical_msg"`
	FriendlyMsg    *string `json:"friendly_msg"`
	CreatedAt      string  `json:"created_at"`
}

type SyncLogsRepo struct {
	db *sql.DB
}

func NewSyncLogsRepo(db *sql.DB) *SyncLogsRepo {
	return &SyncLogsRepo{db: db}
}

func (r *SyncLogsRepo) Insert(log *SyncLog) error {
	if log.ID == "" {
		log.ID = uuid.New().String()
	}
	if log.CreatedAt == "" {
		log.CreatedAt = time.Now().UTC().Format(time.RFC3339)
	}
	_, err := r.db.Exec(`
		INSERT INTO sync_logs (id, session_id, destination_table, pk_json, problem_column, source_value, mariadb_code, technical_msg, friendly_msg, created_at)
		VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
		log.ID, log.SessionID, log.DestinationTable, log.PKJSON, log.ProblemColumn, log.SourceValue, log.MariaDBCode, log.TechnicalMsg, log.FriendlyMsg, log.CreatedAt)
	return err
}

func (r *SyncLogsRepo) ListBySession(sessionID string) ([]SyncLog, error) {
	rows, err := r.db.Query(`
		SELECT id, session_id, destination_table, pk_json, problem_column, source_value, mariadb_code, technical_msg, friendly_msg, created_at
		FROM sync_logs WHERE session_id = ? ORDER BY created_at DESC`, sessionID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var logs []SyncLog
	for rows.Next() {
		var l SyncLog
		if err := rows.Scan(&l.ID, &l.SessionID, &l.DestinationTable, &l.PKJSON, &l.ProblemColumn, &l.SourceValue, &l.MariaDBCode, &l.TechnicalMsg, &l.FriendlyMsg, &l.CreatedAt); err != nil {
			return nil, err
		}
		logs = append(logs, l)
	}
	return logs, rows.Err()
}

func (r *SyncLogsRepo) ListBySessionPaginated(sessionID string, limit, offset int) ([]SyncLog, error) {
	rows, err := r.db.Query(`
		SELECT id, session_id, destination_table, pk_json, problem_column, source_value, mariadb_code, technical_msg, friendly_msg, created_at
		FROM sync_logs WHERE session_id = ? ORDER BY created_at DESC LIMIT ? OFFSET ?`, sessionID, limit, offset)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var logs []SyncLog
	for rows.Next() {
		var l SyncLog
		if err := rows.Scan(&l.ID, &l.SessionID, &l.DestinationTable, &l.PKJSON, &l.ProblemColumn, &l.SourceValue, &l.MariaDBCode, &l.TechnicalMsg, &l.FriendlyMsg, &l.CreatedAt); err != nil {
			return nil, err
		}
		logs = append(logs, l)
	}
	return logs, rows.Err()
}

func (r *SyncLogsRepo) CountByCode(sessionID string, code int) (int, error) {
	var count int
	err := r.db.QueryRow(`SELECT COUNT(*) FROM sync_logs WHERE session_id = ? AND mariadb_code = ?`, sessionID, code).Scan(&count)
	return count, err
}

func (r *SyncLogsRepo) CountByTable(sessionID, table string) (int, error) {
	var count int
	err := r.db.QueryRow(`SELECT COUNT(*) FROM sync_logs WHERE session_id = ? AND destination_table = ?`, sessionID, table).Scan(&count)
	return count, err
}

func PKToJSON(pk map[string]any) (string, error) {
	b, err := json.Marshal(pk)
	if err != nil {
		return "", err
	}
	return string(b), nil
}

type LogGroup struct {
	MariaDBCode    int    `json:"mariadb_code"`
	Count          int    `json:"count"`
	FriendlySummary string `json:"friendly_summary"`
}

func (r *SyncLogsRepo) GetGroupsByCode(sessionID string) ([]LogGroup, error) {
	rows, err := r.db.Query(`
		SELECT mariadb_code, COUNT(*) as cnt, MAX(friendly_msg) as friendly
		FROM sync_logs WHERE session_id = ? GROUP BY mariadb_code ORDER BY cnt DESC`, sessionID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var groups []LogGroup
	for rows.Next() {
		var g LogGroup
		if err := rows.Scan(&g.MariaDBCode, &g.Count, &g.FriendlySummary); err != nil {
			return nil, err
		}
		groups = append(groups, g)
	}
	return groups, rows.Err()
}

func (r *SyncLogsRepo) ListByCode(sessionID string, code int, limit, offset int) ([]SyncLog, error) {
	rows, err := r.db.Query(`
		SELECT id, session_id, destination_table, pk_json, problem_column, source_value, mariadb_code, technical_msg, friendly_msg, created_at
		FROM sync_logs WHERE session_id = ? AND mariadb_code = ? ORDER BY created_at DESC LIMIT ? OFFSET ?`, sessionID, code, limit, offset)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var logs []SyncLog
	for rows.Next() {
		var l SyncLog
		if err := rows.Scan(&l.ID, &l.SessionID, &l.DestinationTable, &l.PKJSON, &l.ProblemColumn, &l.SourceValue, &l.MariaDBCode, &l.TechnicalMsg, &l.FriendlyMsg, &l.CreatedAt); err != nil {
			return nil, err
		}
		logs = append(logs, l)
	}
	return logs, rows.Err()
}