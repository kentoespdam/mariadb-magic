package db

import (
	"database/sql"
	"fmt"
	"os"
	"path/filepath"
	"time"
)

func Heal(db *sql.DB, dbPath string) error {
	result, err := db.Exec("PRAGMA integrity_check")
	if err != nil {
		return fmt.Errorf("failed to run integrity check: %w", err)
	}

	rows, err := result.RowsAffected()
	if err != nil {
		return err
	}

	if rows > 0 {
		row := db.QueryRow("PRAGMA integrity_check")
		var status string
		if err := row.Scan(&status); err != nil {
			return err
		}
		if status != "ok" {
			return quarantineAndRebuild(dbPath)
		}
	}

	if err := cleanupZombieSessions(db); err != nil {
		return fmt.Errorf("zombie session cleanup: %w", err)
	}

	return nil
}

func cleanupZombieSessions(db *sql.DB) error {
	now := time.Now().UTC().Format(time.RFC3339)
	_, err := db.Exec(`
		UPDATE sync_sessions 
		SET status = 'interrupted', ended_at = ?, updated_at = ?
		WHERE status = 'running'`, now, now)
	return err
}

func quarantineAndRebuild(dbPath string) error {
	backupPath := dbPath + ".bak." + time.Now().Format("20060102150405")

	if err := os.Rename(dbPath, backupPath); err != nil {
		return fmt.Errorf("failed to quarantine corrupt DB: %w", err)
	}

	db, err := sql.Open("sqlite3", dbPath)
	if err != nil {
		return fmt.Errorf("failed to create fresh DB: %w", err)
	}
	defer db.Close()

	migrations, err := readMigrations()
	if err != nil {
		return err
	}

	for _, m := range migrations {
		content, err := readMigrationContent(m)
		if err != nil {
			return err
		}
		if _, err := db.Exec(content); err != nil {
			return fmt.Errorf("failed to apply migration %s: %w", m, err)
		}
	}

	return nil
}

func HasDB(path string) bool {
	info, err := os.Stat(path)
	if err != nil {
		return false
	}
	return !info.IsDir() && info.Size() > 0
}

func EnsureDB(path string, migrator *Bootstrapper) error {
	if !HasDB(path) {
		dir := filepath.Dir(path)
		if err := os.MkdirAll(dir, 0755); err != nil {
			return err
		}
		return migrator.Ensure()
	}
	return nil
}