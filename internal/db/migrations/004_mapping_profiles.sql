PRAGMA auto_vacuum = INCREMENTAL;

ALTER TABLE mapping_profiles ADD COLUMN source_connection_id TEXT;
ALTER TABLE mapping_profiles ADD COLUMN destination_connection_id TEXT;
ALTER TABLE mapping_profiles ADD COLUMN selection_json TEXT;

INSERT INTO _migrations (version) VALUES (4);