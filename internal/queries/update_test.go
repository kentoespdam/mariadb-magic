package queries

import (
    "context"
    "database/sql"
    "testing"

    _ "github.com/mattn/go-sqlite3"
)

func TestGenerateUpdate_Basic(t *testing.T) {
    updates := map[string]interface{}{"name": "Charlie", "age": 40}
    stmt, args, err := GenerateUpdate(context.Background(), nil, "users", updates, nil)
    if err != nil {
        t.Fatalf("unexpected error: %v", err)
    }
    expected := "UPDATE users SET age=?, name=?"
    if stmt != expected {
        t.Errorf("got stmt %q, want %q", stmt, expected)
    }
    if args[0] != 40 || args[1] != "Charlie" {
        t.Errorf("unexpected args: %v", args)
    }
}

func TestGenerateUpdate_WithWhere(t *testing.T) {
    updates := map[string]interface{}{"status": "active"}
    where := map[string]interface{}{"id": 5}
    stmt, args, err := GenerateUpdate(context.Background(), nil, "accounts", updates, where)
    if err != nil {
        t.Fatalf("unexpected error: %v", err)
    }
    expected := "UPDATE accounts SET status=? WHERE id=?"
    if stmt != expected {
        t.Errorf("got stmt %q, want %q", stmt, expected)
    }
    if args[0] != "active" || args[1] != 5 {
        t.Errorf("unexpected args: %v", args)
    }
}

func TestGenerateUpdate_NoUpdates(t *testing.T) {
    _, _, err := GenerateUpdate(context.Background(), nil, "t", map[string]interface{}{}, nil)
    if err == nil {
        t.Fatal("expected error for no updates")
    }
}

func TestGenerateUpdate_EmptyTable(t *testing.T) {
    _, _, err := GenerateUpdate(context.Background(), nil, "", map[string]interface{}{"a": 1}, nil)
    if err == nil {
        t.Fatal("expected error for empty table")
    }
}

func TestGenerateUpdate_WithDBValidation(t *testing.T) {
    db, err := sql.Open("sqlite3", ":memory:")
    if err != nil {
        t.Skipf("sqlite3 driver not available: %v", err)
    }
    defer db.Close()

    _, err = db.Exec(`CREATE TABLE products (id INTEGER PRIMARY KEY, price REAL, name TEXT)`)
    if err != nil {
        t.Fatalf("create table: %v", err)
    }

    updates := map[string]interface{}{"price": 99.99, "name": "NewName"}
    where := map[string]interface{}{"id": 1}
    stmt, args, err := GenerateUpdate(context.Background(), db, "products", updates, where)
    if err != nil {
        t.Fatalf("unexpected error: %v", err)
    }
    if len(stmt) == 0 {
        t.Fatal("empty statement")
    }
    // args order: name (sorted first), price (sorted second), id (from where)
    if args[0] != "NewName" || args[1] != 99.99 || args[2] != 1 {
        t.Errorf("unexpected args: %v", args)
    }
}

func TestGenerateUpdate_ColumnValidationFailure(t *testing.T) {
    db, err := sql.Open("sqlite3", ":memory:")
    if err != nil {
        t.Skipf("sqlite3 driver not available: %v", err)
    }
    defer db.Close()

    _, err = db.Exec(`CREATE TABLE items (id INTEGER PRIMARY KEY, label TEXT)`)
    if err != nil {
        t.Fatalf("create table: %v", err)
    }

    updates := map[string]interface{}{"unknown_col": "x"}
    _, _, err = GenerateUpdate(context.Background(), db, "items", updates, nil)
    if err == nil {
        t.Fatal("expected error for unknown column")
    }
}
