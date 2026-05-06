-- SQLite schema for mariadb-magic internal database

-- Connection profiles for MariaDB/MySQL instances
CREATE TABLE IF NOT EXISTS connections (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    name            TEXT NOT NULL UNIQUE,
    host            TEXT NOT NULL,
    port            INTEGER NOT NULL DEFAULT 3306,
    username        TEXT NOT NULL,
    password        TEXT NOT NULL,
    database        TEXT NOT NULL,
    ssl_mode        TEXT NOT NULL DEFAULT 'preferred',
    created_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Column/data-type mapping profiles between source and target
CREATE TABLE IF NOT EXISTS mapping_profiles (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    name            TEXT NOT NULL UNIQUE,
    source_type     TEXT NOT NULL,
    target_type     TEXT NOT NULL,
    transformation  TEXT NOT NULL DEFAULT '',
    is_default      INTEGER NOT NULL DEFAULT 0,
    created_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Active/queued sync sessions
CREATE TABLE IF NOT EXISTS sync_sessions (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    connection_id   INTEGER NOT NULL,
    mapping_id      INTEGER,
    status          TEXT NOT NULL DEFAULT 'pending',
    started_at      DATETIME,
    completed_at    DATETIME,
    rows_processed  INTEGER NOT NULL DEFAULT 0,
    rows_failed     INTEGER NOT NULL DEFAULT 0,
    error_message   TEXT,
    FOREIGN KEY (connection_id) REFERENCES connections(id) ON DELETE CASCADE,
    FOREIGN KEY (mapping_id) REFERENCES mapping_profiles(id) ON DELETE SET NULL,
    created_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Detailed per-table/row sync logs
CREATE TABLE IF NOT EXISTS sync_logs (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    session_id      INTEGER NOT NULL,
    table_name      TEXT NOT NULL,
    operation       TEXT NOT NULL,
    row_key         TEXT,
    status          TEXT NOT NULL,
    error_message   TEXT,
    duration_ms     INTEGER,
    created_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (session_id) REFERENCES sync_sessions(id) ON DELETE CASCADE
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_connections_name ON connections(name);
CREATE INDEX IF NOT EXISTS idx_mapping_profiles_default ON mapping_profiles(is_default);
CREATE INDEX IF NOT EXISTS idx_sync_sessions_status ON sync_sessions(status);
CREATE INDEX IF NOT EXISTS idx_sync_sessions_connection ON sync_sessions(connection_id);
CREATE INDEX IF NOT EXISTS idx_sync_logs_session ON sync_logs(session_id);
CREATE INDEX IF NOT EXISTS idx_sync_logs_created ON sync_logs(created_at);
