PRAGMA auto_vacuum = INCREMENTAL;

ALTER TABLE connections ADD COLUMN last_test_at TEXT;
ALTER TABLE connections ADD COLUMN last_test_status TEXT DEFAULT 'untested' CHECK (last_test_status IN ('untested', 'ok', 'failed'));
ALTER TABLE connections ADD COLUMN last_test_error_friendly TEXT;

INSERT INTO _migrations (version) VALUES (3);