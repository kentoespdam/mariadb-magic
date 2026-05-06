package db

import (
    "database/sql"
    "embed"
    "fmt"

    _ "github.com/mattn/go-sqlite3"
)

//go:embed schema.sql
var schemaFS embed.FS

// DB wraps the SQLite connection.
type DB struct {
    conn *sql.DB
}

// New initializes the database, applying migrations.
func New(path string) (*DB, error) {
    conn, err := sql.Open("sqlite3", path+"?_fk=1&_journal_mode=WAL")
    if err != nil {
        return nil, fmt.Errorf("open database: %w", err)
    }

    // Apply schema from embedded file.
    schema, err := schemaFS.ReadFile("schema.sql")
    if err != nil {
        return nil, fmt.Errorf("read schema: %w", err)
    }

    if _, err := conn.Exec(string(schema)); err != nil {
        conn.Close()
        return nil, fmt.Errorf("apply schema: %w", err)
    }

    return &DB{conn: conn}, nil
}

// Close closes the database connection.
func (db *DB) Close() error {
    return db.conn.Close()
}

// Conn returns the underlying *sql.DB.
func (db *DB) Conn() *sql.DB {
    return db.conn
}
