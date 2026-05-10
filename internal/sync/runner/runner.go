package runner

import (
	"context"
	"encoding/json"
	"sync"

	"magic-mariadb/internal/models"
	"magic-mariadb/internal/repo"
	"magic-mariadb/internal/sync/upsert"
)

var globalLock sync.Mutex

type Runner struct {
	sessionsRepo *repo.SyncSessionsRepo
	upsertFn     upsert.UpsertFunc
}

func New(sessionsRepo *repo.SyncSessionsRepo, chunkSize int) *Runner {
	return &Runner{
		sessionsRepo: sessionsRepo,
		upsertFn:     upsert.New(upsert.Config{ChunkSize: chunkSize}),
	}
}

func (r *Runner) CanStart() (bool, string, string, error) {
	return r.sessionsRepo.AnyRunning()
}

func (r *Runner) Run(ctx context.Context, sessionID string) error {
	session, err := r.sessionsRepo.Get(sessionID)
	if err != nil || session == nil {
		return err
	}

	var profile models.MappingProfile
	if err := json.Unmarshal(session.ProfileSnapshotJSON, &profile); err != nil {
		r.sessionsRepo.UpdateStatus(sessionID, "failed")
		return err
	}

	srcDB, destDB, err := r.connectProfile(profile)
	if err != nil {
		r.sessionsRepo.UpdateStatus(sessionID, "failed")
		return err
	}
	defer srcDB.Close()
	defer destDB.Close()

	tables, err := getTablesForSelection(srcDB, profile.SelectionJSON)
	if err != nil {
		r.sessionsRepo.UpdateStatus(sessionID, "failed")
		return err
	}

	destSchema, err := getDestSchema(destDB, tables)
	if err != nil {
		r.sessionsRepo.UpdateStatus(sessionID, "failed")
		return err
	}

	results, err := r.upsertFn(ctx, srcDB, destDB, profile, tables, destSchema)
	if err != nil {
		r.sessionsRepo.UpdateStatus(sessionID, "failed")
		return err
	}

	totalProcessed := 0
	totalFailed := 0
	for _, res := range results {
		totalProcessed += res.Inserted + res.Updated
		totalFailed += res.Failed
		r.sessionsRepo.UpdateProgress(sessionID, res.Table, totalProcessed, totalFailed)
	}

	r.sessionsRepo.UpdateStatus(sessionID, "done")
	return nil
}

func (r *Runner) StartSession(ctx context.Context, profileID string) (*repo.SyncSession, error) {
	globalLock.Lock()
	defer globalLock.Unlock()

	running, _, _, err := r.sessionsRepo.AnyRunning()
	if err != nil {
		return nil, err
	}
	if running {
		return nil, ErrSessionConflict
	}

	profile, err := r.sessionsRepo.GetProfileSnapshot(profileID)
	if err != nil {
		return nil, err
	}
	if profile.Status != "ready" {
		return nil, ErrProfileNotReady
	}

	session, err := r.sessionsRepo.Create(profileID, profile)
	if err != nil {
		return nil, err
	}

	go func() {
		if err := r.Run(ctx, session.ID); err != nil {
			r.sessionsRepo.UpdateStatus(session.ID, "failed")
		}
	}()

	return session, nil
}

var (
	ErrSessionConflict = &SessionError{Message: "another session is already running"}
	ErrProfileNotReady  = &SessionError{Message: "profile must be ready before starting sync"}
)

type SessionError struct {
	Message string
}

func (e *SessionError) Error() string {
	return e.Message
}