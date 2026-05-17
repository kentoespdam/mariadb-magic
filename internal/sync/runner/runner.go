package runner

import (
	"context"
	"encoding/json"
	"sync"
	"time"

	"magic-mariadb/internal/observability"
	"magic-mariadb/internal/models"
	"magic-mariadb/internal/repo"
	"magic-mariadb/internal/sync/upsert"
	"magic-mariadb/internal/crypto"
	"magic-mariadb/internal/mariadb"
)

var globalLock sync.Mutex

type Runner struct {
	sessionsRepo *repo.SyncSessionsRepo
	logsRepo     *repo.SyncLogsRepo
	crypto       crypto.KeyProvider
	upsertFn     upsert.UpsertFunc
	cancels      map[string]context.CancelFunc
	mu           sync.Mutex
}

func New(sessionsRepo *repo.SyncSessionsRepo, logsRepo *repo.SyncLogsRepo, chunkSize int, crypto crypto.KeyProvider) *Runner {
	return &Runner{
		sessionsRepo: sessionsRepo,
		logsRepo:     logsRepo,
		crypto:       crypto,
		upsertFn:     upsert.New(upsert.Config{ChunkSize: chunkSize, LogHook: nil}),
		cancels:      make(map[string]context.CancelFunc),
	}
}

func (r *Runner) CanStart() (bool, string, string, error) {
	anyRunning, conflictID, conflictName, err := r.sessionsRepo.AnyRunning()
	return !anyRunning, conflictID, conflictName, err
}

func (r *Runner) Cancel(sessionID string) error {
	r.mu.Lock()
	cancel, ok := r.cancels[sessionID]
	r.mu.Unlock()

	if ok && cancel != nil {
		cancel()
	}
	return nil
}

func (r *Runner) Run(ctx context.Context, sessionID string) error {
	defer func() {
		r.mu.Lock()
		delete(r.cancels, sessionID)
		r.mu.Unlock()
	}()

	session, err := r.sessionsRepo.Get(sessionID)
	if err != nil || session == nil {
		return err
	}

	var profile models.MappingProfile
	if err := json.Unmarshal(session.ProfileSnapshotJSON, &profile); err != nil {
		r.sessionsRepo.UpdateStatus(sessionID, "failed")
		return err
	}

	srcDB, destDB, srcDBName, destDBName, err := r.connectProfile(profile)
	if err != nil {
		r.sessionsRepo.UpdateStatus(sessionID, "failed")
		return err
	}
	defer srcDB.Close()
	defer destDB.Close()

	tables, err := getTablesForSelection(ctx, srcDB, srcDBName, profile.SelectionJSON)
	if err != nil {
		r.sessionsRepo.UpdateStatus(sessionID, "failed")
		return err
	}

	destSchema, err := getDestSchema(ctx, destDB, destDBName, tables)
	if err != nil {
		r.sessionsRepo.UpdateStatus(sessionID, "failed")
		return err
	}

	totalProcessed := 0
	totalFailed := 0

	// Cooperative cancellation check between tables
	for _, table := range tables {
		select {
		case <-ctx.Done():
			r.sessionsRepo.UpdateStatus(sessionID, "cancelled")
			return ctx.Err()
		default:
		}

		results, err := r.upsertFn(ctx, srcDB, destDB, profile, []mariadb.TableSchema{table}, destSchema)
		if err != nil {
			r.sessionsRepo.UpdateStatus(sessionID, "failed")
			return err
		}

		for _, res := range results {
			totalProcessed += res.Inserted + res.Updated
			totalFailed += res.Failed
			r.sessionsRepo.UpdateProgress(sessionID, res.Table, totalProcessed, totalFailed)
		}
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

	observability.SyncStartedTotal.Inc()

	// Detach from request context but allow manual cancellation
	bgCtx, cancel := context.WithCancel(context.WithoutCancel(ctx))
	r.mu.Lock()
	r.cancels[session.ID] = cancel
	r.mu.Unlock()

	startTime := time.Now()
	go func() {
		duration := time.Since(startTime)
		if err := r.Run(bgCtx, session.ID); err != nil {
			// Run handles status update to failed or cancelled
			observability.SyncFailedTotal.Inc()
		}
		observability.SyncDurationSeconds.Observe(duration.Seconds())
	}()

	return session, nil
}

var (
	ErrSessionConflict = &SessionError{Message: "another session is already running"}
	ErrProfileNotReady = &SessionError{Message: "profile must be ready before starting sync"}
)

type SessionError struct {
	Message string
}

func (e *SessionError) Error() string {
	return e.Message
}

func (r *Runner) ListSessions() ([]repo.SyncSession, error) {
	return r.sessionsRepo.List()
}

func (r *Runner) GetSession(id string) (*repo.SyncSession, error) {
	return r.sessionsRepo.Get(id)
}
