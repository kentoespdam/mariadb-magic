-- Sync logs table for per-row errors
CREATE TABLE IF NOT EXISTS sync_logs (
    id TEXT PRIMARY KEY,
    session_id TEXT NOT NULL,
    destination_table TEXT NOT NULL,
    pk_json TEXT,
    problem_column TEXT,
    source_value TEXT,
    mariadb_code INTEGER NOT NULL,
    technical_msg TEXT,
    friendly_msg TEXT,
    created_at TEXT NOT NULL,
    FOREIGN KEY (session_id) REFERENCES sync_sessions(id) ON DELETE CASCADE
);

CREATE INDEX idx_sync_logs_session ON sync_logs(session_id);
CREATE INDEX idx_sync_logs_code ON sync_logs(mariadb_code);