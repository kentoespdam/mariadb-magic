package db

import (
	"database/sql"
	"errors"
	"sort"

	_ "github.com/mattn/go-sqlite3"
)

type Bootstrapper struct {
	dbPath string
}

func NewBootstrapper(dbPath string) *Bootstrapper {
	return &Bootstrapper{dbPath: dbPath}
}

func (b *Bootstrapper) DBPath() string {
	return b.dbPath
}

func (b *Bootstrapper) Connect() (*sql.DB, error) {
	return sql.Open("sqlite3", b.dbPath)
}

func (b *Bootstrapper) Ensure() error {
	conn, err := b.Connect()
	if err != nil {
		return err
	}
	defer conn.Close()

	// Ensure migrations tracking table exists
	if _, err := conn.Exec(`CREATE TABLE IF NOT EXISTS _migrations (
		version INTEGER PRIMARY KEY,
		applied_at TEXT NOT NULL DEFAULT (datetime('now'))
	);`); err != nil {
		return err
	}

	if err := b.applyMigrations(conn); err != nil {
		return err
	}

	return Heal(conn, b.dbPath)
}

func (b *Bootstrapper) applyMigrations(db *sql.DB) error {
	migrations, err := readMigrations()
	if err != nil {
		return err
	}

	if len(migrations) == 0 {
		return errors.New("no migration files found")
	}

	sort.Strings(migrations)

	var maxVersion int
	if err := db.QueryRow("SELECT COALESCE(MAX(version), 0) FROM _migrations").Scan(&maxVersion); err != nil {
		return err
	}

	for _, m := range migrations {
		version := extractVersion(m)
		if version <= maxVersion {
			continue
		}

		content, err := readMigrationContent(m)
		if err != nil {
			return err
		}

		tx, err := db.Begin()
		if err != nil {
			return err
		}

		if _, err := tx.Exec(content); err != nil {
			tx.Rollback()
			return err
		}

		if _, err := tx.Exec("INSERT OR IGNORE INTO _migrations (version) VALUES (?)", version); err != nil {
			tx.Rollback()
			return err
		}

		if err := tx.Commit(); err != nil {
			return err
		}
	}

	return nil
}
