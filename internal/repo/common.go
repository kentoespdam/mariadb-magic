package repo

import (
	"database/sql"
	"time"
)

type Connection struct {
	ID                 string     `json:"id"`
	Name               string     `json:"name"`
	Host               string     `json:"host"`
	Port               int        `json:"port"`
	User               string     `json:"user"`
	Database           string     `json:"database"`
	PasswordCiphertext string     `json:"password_ciphertext,omitempty"`
	PasswordPlain      string     `json:"-"`
	LastTestAt         *time.Time `json:"last_test_at,omitempty"`
	LastTestStatus     *string    `json:"last_test_status,omitempty"`
	LastTestError      *string    `json:"last_test_error_friendly,omitempty"`
	CreatedAt          string     `json:"created_at"`
	UpdatedAt          string     `json:"updated_at"`
}

func scanConnectionRows(rows *sql.Rows) ([]Connection, error) {
	var conns []Connection = []Connection{}
	for rows.Next() {
		var c Connection
		var lastTestAt []byte
		var lastTestStatus, lastTestError []byte
		if err := rows.Scan(&c.ID, &c.Name, &c.Host, &c.Port, &c.User, &c.Database, &c.PasswordCiphertext, &lastTestAt, &lastTestStatus, &lastTestError, &c.CreatedAt, &c.UpdatedAt); err != nil {
			return []Connection{}, err
		}
		if len(lastTestAt) > 0 {
			t, _ := time.Parse(time.RFC3339, string(lastTestAt))
			c.LastTestAt = &t
		}
		if len(lastTestStatus) > 0 {
			c.LastTestStatus = stringPtr(string(lastTestStatus))
		}
		if len(lastTestError) > 0 {
			c.LastTestError = stringPtr(string(lastTestError))
		}
		conns = append(conns, c)
	}
	return conns, rows.Err()
}

func stringPtr(s string) *string {
	return &s
}

func ExecTx(db *sql.DB, fn func(*sql.Tx) error) error {
	tx, err := db.Begin()
	if err != nil {
		return err
	}
	if err := fn(tx); err != nil {
		tx.Rollback()
		return err
	}
	return tx.Commit()
}
