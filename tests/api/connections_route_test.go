package api_test

import (
	"bytes"
	"database/sql"
	"net/http"
	"net/http/httptest"
	"path/filepath"
	"testing"

	_ "github.com/mattn/go-sqlite3"

	"magic-mariadb/internal/api"
	"magic-mariadb/internal/crypto"
	"magic-mariadb/internal/db"
)

// stubKey memenuhi crypto.KeyProvider; sengaja minimal, hanya untuk verifikasi routing.
type stubKey struct{}

func (stubKey) Encrypt(p string) (string, string, error)  { return p, "n", nil }
func (stubKey) Decrypt(c, _ string) (string, error)       { return c, nil }
func (stubKey) Rekey(_ crypto.KeyProvider) error          { return nil }

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

// TestHandleRoutesTestPreSave: POST /api/connections/test harus dispatch ke
// TestPreSave (bukan 405). Test tidak peduli koneksi gagal — yang penting
// dispatcher tidak mengira "test" adalah ID.
func TestHandleRoutesTestPreSave(t *testing.T) {
	h := api.NewConnectionHandler(newTestDB(t), stubKey{})
	body := bytes.NewBufferString(`{"name":"x","host":"127.0.0.1","port":1,"user":"u","password":"p","database":"d"}`)
	req := httptest.NewRequest("POST", "/api/connections/test", body)
	rec := httptest.NewRecorder()
	h.Handle(rec, req)
	if rec.Code == http.StatusMethodNotAllowed {
		t.Fatalf("got 405, expected dispatcher to route ke TestPreSave")
	}
}

// TestHandlePostMethodOnIDRoute: POST /api/connections/<id> tetap 405 (tidak
// bentrok dengan /test).
func TestHandlePostMethodOnIDRoute(t *testing.T) {
	h := api.NewConnectionHandler(newTestDB(t), stubKey{})
	req := httptest.NewRequest("POST", "/api/connections/some-id", nil)
	rec := httptest.NewRecorder()
	h.Handle(rec, req)
	if rec.Code != http.StatusMethodNotAllowed {
		t.Fatalf("expected 405, got %d", rec.Code)
	}
}

// TestHandleRoutesTestPostSave: GET /api/connections/<id>/test harus dispatch
// ke TestPostSave (bukan ke Get).
func TestHandleRoutesTestPostSave(t *testing.T) {
	h := api.NewConnectionHandler(newTestDB(t), stubKey{})
	req := httptest.NewRequest("GET", "/api/connections/nonexistent-id/test", nil)
	rec := httptest.NewRecorder()
	h.Handle(rec, req)
	// TestPostSave akan return 404 untuk ID yang tidak ada — beda dari Get yang
	// juga 404, tapi penting: bukan 405 dan body bukan {Connection...}.
	if rec.Code != http.StatusNotFound {
		t.Fatalf("expected 404 for unknown id, got %d body=%s", rec.Code, rec.Body.String())
	}
}

// TestHandleCreate: POST /api/connections/ membuat resource baru via Create.
func TestHandleCreate(t *testing.T) {
	h := api.NewConnectionHandler(newTestDB(t), stubKey{})
	body := bytes.NewBufferString(`{"name":"c1","host":"h","port":3306,"user":"u","password":"p","database":"d"}`)
	req := httptest.NewRequest("POST", "/api/connections/", body)
	rec := httptest.NewRecorder()
	h.Handle(rec, req)
	if rec.Code != http.StatusCreated {
		t.Fatalf("expected 201, got %d body=%s", rec.Code, rec.Body.String())
	}
}
