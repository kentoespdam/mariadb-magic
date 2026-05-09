PRAGMA auto_vacuum = INCREMENTAL;

CREATE TABLE IF NOT EXISTS app_settings (
    key_mode TEXT CHECK (key_mode IN ('os_keystore', 'passphrase')),
    kdf_salt BLOB,
    kdf_params_json TEXT
);

ALTER TABLE connections RENAME COLUMN password_encrypted TO password_ciphertext;

INSERT INTO _migrations (version) VALUES (2);