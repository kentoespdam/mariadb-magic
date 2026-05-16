-- Rebuild mapping_profiles to remove legacy NOT NULL columns
PRAGMA auto_vacuum = INCREMENTAL;

-- Disable FKs to allow dropping/renaming tables
PRAGMA foreign_keys = OFF;

CREATE TABLE mapping_profiles_new (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    source_connection_id TEXT,
    destination_connection_id TEXT,
    selection_json TEXT,
    column_pairings_json TEXT,
    rules_json TEXT,
    status TEXT NOT NULL DEFAULT 'draft',
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

INSERT INTO mapping_profiles_new (
    id, name, source_connection_id, destination_connection_id,
    selection_json, column_pairings_json, rules_json, status,
    created_at, updated_at
)
SELECT
    id, name, source_connection_id, destination_connection_id,
    selection_json, column_pairings_json, rules_json, status,
    created_at, updated_at
FROM mapping_profiles;

DROP TABLE mapping_profiles;

ALTER TABLE mapping_profiles_new RENAME TO mapping_profiles;

PRAGMA foreign_keys = ON;

-- Migration version 9 is handled by applyMigrations
