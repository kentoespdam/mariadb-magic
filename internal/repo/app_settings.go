package repo

import (
	"database/sql"

	"magic-mariadb/internal/models"
)

type AppSettingsRepo struct {
	db *sql.DB
}

func NewAppSettingsRepo(db *sql.DB) *AppSettingsRepo {
	return &AppSettingsRepo{db: db}
}

func (r *AppSettingsRepo) Get() (*models.AppSettings, error) {
	var s models.AppSettings
	err := r.db.QueryRow("SELECT key_mode, kdf_salt, kdf_params_json FROM app_settings LIMIT 1").
		Scan(&s.KeyMode, &s.KDFSalt, &s.KDFParams)
	if err == sql.ErrNoRows {
		return nil, nil
	}
	if err != nil {
		return nil, err
	}
	return &s, nil
}

func (r *AppSettingsRepo) Set(s *models.AppSettings) error {
	_, err := r.db.Exec(
		"INSERT OR REPLACE INTO app_settings (key_mode, kdf_salt, kdf_params_json) VALUES (?, ?, ?)",
		s.KeyMode, s.KDFSalt, s.KDFParams,
	)
	return err
}
