package sync

import (
    "database/sql"
    _ "modernc.org/sqlite"
    "testing"
)

func setupDBs(t *testing.T) (src *sql.DB, dst *sql.DB) {
    t.Helper()
    var err error
    src, err = sql.Open("sqlite", "file:src?mode=memory&cache=shared")
    if err != nil {
        t.Fatal(err)
    }
    dst, err = sql.Open("sqlite", "file:dst?mode=memory&cache=shared")
    if err != nil {
        t.Fatal(err)
    }
    // Enable foreign keys
    for _, db := range []*sql.DB{src, dst} {
        if _, err := db.Exec("PRAGMA foreign_keys=ON"); err != nil {
            t.Fatal(err)
        }
    }
    // Create parent table
    _, err = src.Exec(`CREATE TABLE parent (id INTEGER PRIMARY KEY, name TEXT)`)
    if err != nil {
        t.Fatal(err)
    }
    _, err = dst.Exec(`CREATE TABLE parent (id INTEGER PRIMARY KEY, name TEXT)`)
    if err != nil {
        t.Fatal(err)
    }
    // Create child table with FK
    _, err = src.Exec(`CREATE TABLE child (
        id INTEGER PRIMARY KEY,
        parent_id INTEGER,
        value TEXT,
        FOREIGN KEY (parent_id) REFERENCES parent(id)
    )`)
    if err != nil {
        t.Fatal(err)
    }
    _, err = dst.Exec(`CREATE TABLE child (
        id INTEGER PRIMARY KEY,
        parent_id INTEGER,
        value TEXT,
        FOREIGN KEY (parent_id) REFERENCES parent(id)
    )`)
    if err != nil {
        t.Fatal(err)
    }
    return
}

func TestDepth1ParentResolution(t *testing.T) {
    src, dst := setupDBs(t)
    defer src.Close()
    defer dst.Close()

    // Insert parent row in source
    _, err := src.Exec("INSERT INTO parent (id, name) VALUES (1, 'parent1')")
    if err != nil {
        t.Fatal(err)
    }
    // Child row that references parent1, not yet in dst
    childRow := map[string]any{
        "id": 100,
        "parent_id": int64(1),
        "value": "test",
    }

    syncer := NewJITParentSyncer(src, dst)
    err = syncer.SyncRows("child", []map[string]any{childRow})
    if err != nil {
        t.Fatalf("SyncRows failed: %v", err)
    }

    // Verify parent exists in dst
    var parentName string
    err = dst.QueryRow("SELECT name FROM parent WHERE id = 1").Scan(&parentName)
    if err != nil {
        t.Fatalf("parent row not found in dst: %v", err)
    }
    if parentName != "parent1" {
        t.Errorf("expected parent name 'parent1', got %s", parentName)
    }

    // Verify child exists in dst
    var val string
    err = dst.QueryRow("SELECT value FROM child WHERE id = 100").Scan(&val)
    if err != nil {
        t.Fatalf("child row not found in dst: %v", err)
    }
}
