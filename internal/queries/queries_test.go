package queries

import (
    "context"
    "database/sql"
    "testing"

    _ "github.com/mattn/go-sqlite3"
)

func TestGenerateInsert_Basic(t *testing.T) {
    rows := []map[string]interface{}{
        {"name": "Alice", "age": 30},
    }
    stmt, args, err := GenerateInsert(context.Background(), nil, "users", rows)
    if err != nil {
        t.Fatalf("unexpected error: %v", err)
    }
    expected := "INSERT INTO users (age, name) VALUES (?, ?)"
    if stmt != expected {
        t.Errorf("got stmt %q, want %q", stmt, expected)
    }
    if len(args) != 2 || args[0] != 30 || args[1] != "Alice" {
        t.Errorf("unexpected args: %v", args)
    }
}

func TestGenerateInsert_MultipleRows(t *testing.T) {
    rows := []map[string]interface{}{
        {"id": 1, "val": "a"},
        {"id": 2, "val": "b"},
    }
    stmt, args, err := GenerateInsert(context.Background(), nil, "items", rows)
    if err != nil {
        t.Fatalf("unexpected error: %v", err)
    }
    expected := "INSERT INTO items (id, val) VALUES (?, ?), (?, ?) ON CONFLICT(id) DO UPDATE SET val=excluded.val"
    if stmt != expected {
        t.Errorf("got stmt %q, want %q", stmt, expected)
    }
    if len(args) != 4 || args[0] != 1 || args[1] != "a" || args[2] != 2 || args[3] != "b" {
        t.Errorf("unexpected args: %v", args)
    }
}

func TestGenerateInsert_NoRows(t *testing.T) {
    _, _, err := GenerateInsert(context.Background(), nil, "t", []map[string]interface{}{})
    if err == nil {
        t.Fatal("expected error for empty rows")
    }
}

func TestGenerateInsert_EmptyTable(t *testing.T) {
    _, _, err := GenerateInsert(context.Background(), nil, "", []map[string]interface{}{{"a": 1}})
    if err == nil {
        t.Fatal("expected error for empty table")
    }
}

func TestGenerateInsert_WithDBValidation(t *testing.T) {
    db, err := sql.Open("sqlite3", ":memory:")
    if err != nil {
        t.Skipf("sqlite3 driver not available: %v", err)
    }
    defer db.Close()

    _, err = db.Exec(`CREATE TABLE users (id INTEGER PRIMARY KEY, name TEXT)`)
    if err != nil {
        t.Fatalf("create table: %v", err)
    }

    rows := []map[string]interface{}{
        {"id": 100, "name": "Bob"},
    }
    stmt, args, err := GenerateInsert(context.Background(), db, "users", rows)
    if err != nil {
        t.Fatalf("unexpected error: %v", err)
    }
    if stmt != "INSERT INTO users (id, name) VALUES (?, ?) ON CONFLICT(id) DO UPDATE SET name=excluded.name" {
        t.Errorf("unexpected stmt: %s", stmt)
    }
    if args[0] != 100 || args[1] != "Bob" {
        t.Errorf("unexpected args: %v", args)
    }
}

func TestGenerateInsert_ColumnValidationFailure(t *testing.T) {
    db, err := sql.Open("sqlite3", ":memory:")
    if err != nil {
        t.Skipf("sqlite3 driver not available: %v", err)
    }
    defer db.Close()

    _, err = db.Exec(`CREATE TABLE data (id INTEGER PRIMARY KEY, value TEXT)`)
    if err != nil {
        t.Fatalf("create table: %v", err)
    }

    rows := []map[string]interface{}{
        {"id": 1, "unknown_col": "x"},
    }
    _, _, err = GenerateInsert(context.Background(), db, "data", rows)
    if err == nil {
        t.Fatal("expected error for unknown column")
    }
}
