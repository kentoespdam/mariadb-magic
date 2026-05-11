PRAGMA auto_vacuum = INCREMENTAL;

CREATE TABLE IF NOT EXISTS _migrations (
    version INTEGER PRIMARY KEY,
    applied_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS connections (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    host TEXT NOT NULL,
    port INTEGER NOT NULL DEFAULT 3306,
    user TEXT NOT NULL,
    password_encrypted TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS mapping_profiles (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    source_table TEXT NOT NULL,
    target_table TEXT NOT NULL,
    columns_json TEXT NOT NULL,
    rules_json TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'draft',
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

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
    updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS sync_logs (
    id TEXT PRIMARY KEY,
    session_id TEXT NOT NULL,
    table_name TEXT NOT NULL,
    pk_value TEXT NOT NULL,
    mariadb_code INTEGER,
    technical_msg TEXT,
    friendly_msg TEXT,
    error_code TEXT,
    error_message TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
);