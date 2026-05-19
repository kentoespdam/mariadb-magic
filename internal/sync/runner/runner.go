package runner

import (
	"context"
	"database/sql"
	"encoding/json"
	"fmt"
	"strings"
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

type ProgressPublisher interface {
	PublishProgress(sessionID string, table string, processed, failed int)
	PublishRowFailed(sessionID, table, col, val string, code int, friendly string)
	PublishDone(sessionID string, processed, failed int)
	PublishCancelled(sessionID string, processed, failed int)
	PublishError(sessionID, msg string)
}

type Runner struct {
	sessionsRepo *repo.SyncSessionsRepo
	logsRepo     *repo.SyncLogsRepo
	crypto       crypto.KeyProvider
	upsertFn     upsert.UpsertFunc
	publisher    ProgressPublisher
	cancels      map[string]context.CancelFunc
	mu           sync.Mutex

	// Test hooks / dependencies
	connectProfileFn func(profile models.MappingProfile) (*sql.DB, *sql.DB, string, string, error)
	getTablesFn      func(ctx context.Context, srcDB *sql.DB, srcDBName string, selectionJSON []byte) ([]mariadb.TableSchema, error)
	getDestSchemaFn  func(ctx context.Context, destDB *sql.DB, destDBName string, tables []mariadb.TableSchema) (map[string]models.TableSchema, error)
}

func New(sessionsRepo *repo.SyncSessionsRepo, logsRepo *repo.SyncLogsRepo, chunkSize int, crypto crypto.KeyProvider, publisher ProgressPublisher) *Runner {
	r := &Runner{
		sessionsRepo: sessionsRepo,
		logsRepo:     logsRepo,
		crypto:       crypto,
		upsertFn:     upsert.New(upsert.Config{ChunkSize: chunkSize, LogHook: nil}),
		publisher:    publisher,
		cancels:      make(map[string]context.CancelFunc),
	}
	// Default implementations
	r.connectProfileFn = r.connectProfile
	r.getTablesFn = getTablesForSelection
	r.getDestSchemaFn = getDestSchema
	return r
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

	srcDB, destDB, srcDBName, destDBName, err := r.connectProfileFn(profile)
	if err != nil {
		r.sessionsRepo.UpdateStatus(sessionID, "failed")
		return err
	}
	defer srcDB.Close()
	defer destDB.Close()

	tables, err := r.getTablesFn(ctx, srcDB, srcDBName, profile.SelectionJSON)
	if err != nil {
		r.sessionsRepo.UpdateStatus(sessionID, "failed")
		return err
	}

	destSchema, err := r.getDestSchemaFn(ctx, destDB, destDBName, tables)
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
			if r.publisher != nil {
				r.publisher.PublishCancelled(sessionID, totalProcessed, totalFailed)
			}
			return ctx.Err()
		default:
		}

		results, err := r.upsertFn(ctx, srcDB, destDB, profile, []mariadb.TableSchema{table}, destSchema)
		if err != nil {
			r.sessionsRepo.UpdateStatus(sessionID, "failed")
			if r.publisher != nil {
				r.publisher.PublishError(sessionID, err.Error())
			}
			return err
		}

		for _, res := range results {
			totalProcessed += res.Inserted + res.Updated
			totalFailed += res.Failed
			r.sessionsRepo.UpdateProgress(sessionID, res.Table, totalProcessed, totalFailed)
			if r.publisher != nil {
				r.publisher.PublishProgress(sessionID, res.Table, totalProcessed, totalFailed)
			}

			if res.Fatal || len(res.Errors) > 0 {
				msg := fmt.Sprintf("table %s: %s", res.Table, strings.Join(res.Errors, "; "))
				if r.logsRepo != nil {
					r.logsRepo.Insert(&repo.SyncLog{
						SessionID:        sessionID,
						DestinationTable: res.Table,
						TechnicalMsg:     &msg,
						FriendlyMsg:      &msg,
					})
				}
				if r.publisher != nil {
					r.publisher.PublishError(sessionID, msg)
				}
				if res.Fatal {
					r.sessionsRepo.UpdateStatus(sessionID, "failed")
					return fmt.Errorf("table %s: %s", res.Table, strings.Join(res.Errors, "; "))
				}
			}
		}
	}

	r.sessionsRepo.UpdateStatus(sessionID, "done")
	if r.publisher != nil {
		r.publisher.PublishDone(sessionID, totalProcessed, totalFailed)
	}
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
