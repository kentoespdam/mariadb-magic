-- Sync sessions table for tracking sync runs
CREATE TABLE IF NOT EXISTS sync_sessions (
    id TEXT PRIMARY KEY,
    profile_id TEXT NOT NULL,
    profile_snapshot_json TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'running' CHECK(status IN ('running', 'done', 'interrupted', 'failed', 'cancelled')),
    started_at TEXT NOT NULL,
    ended_at TEXT,
    rows_processed INTEGER DEFAULT 0,
    rows_failed INTEGER DEFAULT 0,
    current_table TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    FOREIGN KEY (profile_id) REFERENCES mapping_profiles(id)
);

CREATE INDEX idx_sync_sessions_status ON sync_sessions(status);
CREATE INDEX idx_sync_sessions_profile ON sync_sessions(profile_id);