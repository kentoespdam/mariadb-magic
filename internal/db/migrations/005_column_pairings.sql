PRAGMA auto_vacuum = INCREMENTAL;

ALTER TABLE mapping_profiles ADD COLUMN column_pairings_json TEXT;

INSERT INTO _migrations (version) VALUES (5);