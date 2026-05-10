package maint

import (
	"context"
	"database/sql"
	"log"
	"sync"
	"time"

	"magic-mariadb/internal/repo"
)

const (
	LogsCapHigh       = 500000
	LogsCapLow        = 400000
	SessionsCapHigh   = 10000
	SessionsCapLow    = 9000
	EvictBatch        = 100000
	EvictSessionBatch = 1000
)

type Retention struct {
	db           *sql.DB
	sessionsRepo *repo.SyncSessionsRepo
	logsRepo     *repo.SyncLogsRepo
	mu           sync.Mutex
	running      bool
}

func NewRetention(db *sql.DB) *Retention {
	return &Retention{
		db:           db,
		sessionsRepo: repo.NewSyncSessionsRepo(db),
		logsRepo:     repo.NewSyncLogsRepo(db),
	}
}

func (r *Retention) Start(ctx context.Context) {
	r.mu.Lock()
	if r.running {
		r.mu.Unlock()
		return
	}
	r.running = true
	r.mu.Unlock()

	go func() {
		ticker := time.NewTicker(1 * time.Hour)
		defer ticker.Stop()
		for {
			select {
			case <-ctx.Done():
				return
			case <-ticker.C:
				r.EvictIfOver(context.Background())
			}
		}
	}()
}

func (r *Retention) EvictIfOver(ctx context.Context) error {
	r.mu.Lock()
	defer r.mu.Unlock()

	logsCount, err := r.logsRepo.Count()
	if err != nil {
		return err
	}

	if logsCount > LogsCapHigh {
		toDelete := logsCount - LogsCapLow
		if toDelete > 0 {
			if err := r.logsRepo.EvictOldest(ctx, toDelete); err != nil {
				return err
			}
			if err := r.vacuum(ctx, 100); err != nil {
				log.Printf("vacuum after logs evict: %v", err)
			}
		}
	}

	sessionsCount, err := r.sessionsRepo.Count()
	if err != nil {
		return err
	}

	if sessionsCount > SessionsCapHigh {
		toDelete := sessionsCount - SessionsCapLow
		if toDelete > 0 {
			if err := r.sessionsRepo.EvictOldest(ctx, toDelete); err != nil {
				return err
			}
			if err := r.vacuum(ctx, 50); err != nil {
				log.Printf("vacuum after sessions evict: %v", err)
			}
		}
	}

	return nil
}

func (r *Retention) vacuum(ctx context.Context, pages int) error {
	_, err := r.db.ExecContext(ctx, "PRAGMA incremental_vacuum(?)", pages)
	return err
}

type Stats struct {
	LogsCount     int   `json:"logs_count"`
	SessionsCount int   `json:"sessions_count"`
	DBSizeBytes   int64 `json:"db_size_bytes"`
}

func (r *Retention) GetStats(ctx context.Context) (*Stats, error) {
	logsCount, err := r.logsRepo.Count()
	if err != nil {
		return nil, err
	}

	sessionsCount, err := r.sessionsRepo.Count()
	if err != nil {
		return nil, err
	}

	var pageCount int64
	var pageSize int64
	row := r.db.QueryRow("PRAGMA page_count")
	row.Scan(&pageCount)
	row = r.db.QueryRow("PRAGMA page_size")
	row.Scan(&pageSize)

	return &Stats{
		LogsCount:     logsCount,
		SessionsCount: sessionsCount,
		DBSizeBytes:   pageCount * pageSize,
	}, nil
}

func (r *Retention) TriggerEvict(ctx context.Context) error {
	return r.EvictIfOver(ctx)
}
