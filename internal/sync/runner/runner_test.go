package runner

import (
	"context"
	"database/sql"
	"path/filepath"
	"testing"

	_ "github.com/mattn/go-sqlite3"

	"magic-mariadb/internal/crypto"
	"magic-mariadb/internal/db"
	"magic-mariadb/internal/models"
	"magic-mariadb/internal/repo"
	"magic-mariadb/internal/sync/upsert"
	"magic-mariadb/internal/mariadb"
)

type stubKey struct{}

func (stubKey) Encrypt(p string) (string, string, error) { return p, "n", nil }
func (stubKey) Decrypt(c, _ string) (string, error)      { return c, nil }
func (stubKey) Rekey(_ crypto.KeyProvider) error         { return nil }

type mockPublisher struct {
	errors []string
}

func (m *mockPublisher) PublishProgress(sessionID string, table string, processed, failed int) {}
func (m *mockPublisher) PublishRowFailed(sessionID, table, col, val string, code int, friendly string) {}
func (m *mockPublisher) PublishDone(sessionID string, processed, failed int)                  {}
func (m *mockPublisher) PublishCancelled(sessionID string, processed, failed int)             {}
func (m *mockPublisher) PublishError(sessionID, msg string) {
	m.errors = append(m.errors, msg)
}

func newTestDB(t *testing.T) *sql.DB {
	t.Helper()
	dir := t.TempDir()
	path := filepath.Join(dir, "test.db")
	if err := db.NewBootstrapper(path).Ensure(); err != nil {
		t.Fatalf("bootstrap: %v", err)
	}
	conn, err := sql.Open("sqlite3", path)
	if err != nil {
		t.Fatalf("open: %v", err)
	}
	t.Cleanup(func() { conn.Close() })
	return conn
}

func TestRun_SilentFailRepro(t *testing.T) {
	dir := t.TempDir()
	dbPath := filepath.Join(dir, "test.db")
	if err := db.NewBootstrapper(dbPath).Ensure(); err != nil {
		t.Fatalf("bootstrap: %v", err)
	}
	dbConn, _ := sql.Open("sqlite3", dbPath)
	defer dbConn.Close()

	sessionsRepo := repo.NewSyncSessionsRepo(dbConn)
	logsRepo := repo.NewSyncLogsRepo(dbConn)
	publisher := &mockPublisher{}
	
	r := New(sessionsRepo, logsRepo, 500, stubKey{}, publisher)
	
	// Mock dependencies to bypass real DB connections
	r.connectProfileFn = func(profile models.MappingProfile) (*sql.DB, *sql.DB, string, string, error) {
		s, _ := sql.Open("sqlite3", dbPath)
		d, _ := sql.Open("sqlite3", dbPath)
		return s, d, "src", "dest", nil
	}
	r.getTablesFn = func(ctx context.Context, srcDB *sql.DB, srcDBName string, selectionJSON []byte) ([]mariadb.TableSchema, error) {
		return []mariadb.TableSchema{{Name: "orders"}}, nil
	}
	r.getDestSchemaFn = func(ctx context.Context, destDB *sql.DB, destDBName string, tables []mariadb.TableSchema) (map[string]models.TableSchema, error) {
		return map[string]models.TableSchema{"orders": {}}, nil
	}

	// Mock upsertFn to return "no mapping found" error
	r.upsertFn = func(ctx context.Context, srcDB, destDB *sql.DB, profile models.MappingProfile, tables []mariadb.TableSchema, destSchema map[string]models.TableSchema) ([]upsert.Result, error) {
		return []upsert.Result{
			{Table: "orders", Errors: []string{"no mapping found"}, Fatal: true},
		}, nil
	}

	// 1. Setup: Create a profile and session
	profile := models.MappingProfile{
		ID:                     "prof_1",
		Name:                   "Test Profile",
		SourceConnectionID:     "conn_src",
		DestinationConnectionID: "conn_dst",
		SelectionJSON:          []byte(`{"tables":["orders"]}`),
	}
	
	session, err := sessionsRepo.Create(profile.ID, profile)
	if err != nil {
		t.Fatalf("failed to create session: %v", err)
	}

	// 2. Execute Run
	err = r.Run(context.Background(), session.ID)
	// We expect an error here now because of Fatal: true
	if err == nil {
		t.Errorf("expected Run to return an error because of Fatal: true, but got nil")
	}

	// 3. Verify: Session should NOT be "done" if there were errors
	updatedSession, err := sessionsRepo.Get(session.ID)
	if err != nil {
		t.Fatalf("failed to get updated session: %v", err)
	}
	if updatedSession == nil {
		t.Fatalf("updated session is nil")
	}
	if updatedSession.Status != "failed" {
		t.Errorf("expected session status to be 'failed', but got '%s'", updatedSession.Status)
	}

	// Verify error is in logs
	logs, err := logsRepo.ListBySession(session.ID)
	if err != nil {
		t.Fatalf("failed to get logs: %v", err)
	}
	if len(logs) == 0 {
		t.Errorf("expected error log to be created, but got none")
	} else if *logs[0].TechnicalMsg != "table orders: no mapping found" {
		t.Errorf("expected log message 'table orders: no mapping found', but got '%s'", *logs[0].TechnicalMsg)
	}
}

func TestRun_MultipleTables_OneFatal(t *testing.T) {
	dir := t.TempDir()
	dbPath := filepath.Join(dir, "test2.db")
	db.NewBootstrapper(dbPath).Ensure()
	dbConn, _ := sql.Open("sqlite3", dbPath)
	defer dbConn.Close()

	sessionsRepo := repo.NewSyncSessionsRepo(dbConn)
	logsRepo := repo.NewSyncLogsRepo(dbConn)
	publisher := &mockPublisher{}
	
	r := New(sessionsRepo, logsRepo, 500, stubKey{}, publisher)
	
	r.connectProfileFn = func(profile models.MappingProfile) (*sql.DB, *sql.DB, string, string, error) {
		s, _ := sql.Open("sqlite3", dbPath)
		d, _ := sql.Open("sqlite3", dbPath)
		return s, d, "src", "dest", nil
	}
	r.getTablesFn = func(ctx context.Context, srcDB *sql.DB, srcDBName string, selectionJSON []byte) ([]mariadb.TableSchema, error) {
		return []mariadb.TableSchema{{Name: "table1"}, {Name: "table2"}}, nil
	}
	r.getDestSchemaFn = func(ctx context.Context, destDB *sql.DB, destDBName string, tables []mariadb.TableSchema) (map[string]models.TableSchema, error) {
		return map[string]models.TableSchema{"table1": {}, "table2": {}}, nil
	}

	r.upsertFn = func(ctx context.Context, srcDB, destDB *sql.DB, profile models.MappingProfile, tables []mariadb.TableSchema, destSchema map[string]models.TableSchema) ([]upsert.Result, error) {
		if tables[0].Name == "table1" {
			return []upsert.Result{{Table: "table1", Inserted: 10}}, nil
		}
		return []upsert.Result{{Table: "table2", Errors: []string{"fatal error"}, Fatal: true}}, nil
	}

	profile := models.MappingProfile{
		ID:            "prof_1",
		SelectionJSON: []byte(`{"tables":["table1", "table2"]}`),
	}
	session, _ := sessionsRepo.Create(profile.ID, profile)

	err := r.Run(context.Background(), session.ID)
	if err == nil {
		t.Errorf("expected error, got nil")
	}

	updatedSession, _ := sessionsRepo.Get(session.ID)
	if updatedSession.Status != "failed" {
		t.Errorf("expected status failed, got %s", updatedSession.Status)
	}
	if updatedSession.RowsProcessed != 10 {
		t.Errorf("expected 10 rows processed, got %d", updatedSession.RowsProcessed)
	}

	logs, _ := logsRepo.ListBySession(session.ID)
	if len(logs) != 1 {
		t.Errorf("expected 1 log, got %d", len(logs))
	}
}
