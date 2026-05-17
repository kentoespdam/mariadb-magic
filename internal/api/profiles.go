package api

import (
	"database/sql"
	"magic-mariadb/internal/crypto"
	"magic-mariadb/internal/repo"
	"magic-mariadb/internal/sync/runner"
)

type ProfilesHandler struct {
	repo          *repo.MappingProfilesRepo
	crypto        crypto.KeyProvider
	runner        *runner.Runner
	logsRepo      *repo.SyncLogsRepo
	sessionsRepo  *repo.SyncSessionsRepo
}

func NewProfilesHandler(db *sql.DB, crypto crypto.KeyProvider) *ProfilesHandler {
	sessionsRepo := repo.NewSyncSessionsRepo(db)
	logsRepo := repo.NewSyncLogsRepo(db)
	r := runner.New(sessionsRepo, logsRepo, 5000, crypto)
	return &ProfilesHandler{
		repo:         repo.NewMappingProfilesRepo(db),
		crypto:       crypto,
		runner:       r,
		logsRepo:     logsRepo,
		sessionsRepo: sessionsRepo,
	}
}