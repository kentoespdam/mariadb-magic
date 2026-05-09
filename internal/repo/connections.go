package repo

import (
	"database/sql"
	"time"

	"github.com/google/uuid"
)

type ConnectionsRepo struct {
	db *sql.DB
}

func NewConnectionsRepo(db *sql.DB) *ConnectionsRepo {
	return &ConnectionsRepo{db: db}
}

func (r *ConnectionsRepo) List() ([]Connection, error) {
	rows, err := r.db.Query(`
		SELECT id, name, host, port, user, password_ciphertext, last_test_at, last_test_status, last_test_error_friendly, created_at, updated_at 
		FROM connections ORDER BY name`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	return scanConnectionRows(rows)
}

func (r *ConnectionsRepo) Get(id string) (*Connection, error) {
	row := r.db.QueryRow(`
		SELECT id, name, host, port, user, password_ciphertext, last_test_at, last_test_status, last_test_error_friendly, created_at, updated_at 
		FROM connections WHERE id = ?`, id)
	var c Connection
	var lastTestAt []byte
	var lastTestStatus, lastTestError []byte
	err := row.Scan(&c.ID, &c.Name, &c.Host, &c.Port, &c.User, &c.PasswordCiphertext, &lastTestAt, &lastTestStatus, &lastTestError, &c.CreatedAt, &c.UpdatedAt)
	if err == sql.ErrNoRows {
		return nil, nil
	}
	if err != nil {
		return nil, err
	}
	if len(lastTestAt) > 0 {
		t, _ := time.Parse(time.RFC3339, string(lastTestAt))
		c.LastTestAt = &t
	}
	if len(lastTestStatus) > 0 {
		str := string(lastTestStatus)
		c.LastTestStatus = &str
	}
	if len(lastTestError) > 0 {
		str := string(lastTestError)
		c.LastTestError = &str
	}
	return &c, nil
}

func (r *ConnectionsRepo) Create(conn *Connection) error {
	if conn.ID == "" {
		conn.ID = uuid.New().String()
	}
	now := time.Now().UTC().Format(time.RFC3339)
	_, err := r.db.Exec(`
		INSERT INTO connections (id, name, host, port, user, password_ciphertext, last_test_status, created_at, updated_at) 
		VALUES (?, ?, ?, ?, ?, ?, 'untested', ?, ?)`,
		conn.ID, conn.Name, conn.Host, conn.Port, conn.User, conn.PasswordCiphertext, now, now)
	return err
}

func (r *ConnectionsRepo) Update(conn *Connection) error {
	now := time.Now().UTC().Format(time.RFC3339)
	_, err := r.db.Exec(`
		UPDATE connections SET name=?, host=?, port=?, user=?, password_ciphertext=?, updated_at=? 
		WHERE id=?`,
		conn.Name, conn.Host, conn.Port, conn.User, conn.PasswordCiphertext, now, conn.ID)
	return err
}

func (r *ConnectionsRepo) Delete(id string) error {
	_, err := r.db.Exec("DELETE FROM connections WHERE id=?", id)
	return err
}

func (r *ConnectionsRepo) UpdateTestStatus(id string, status string, errorFriendly string) error {
	now := time.Now().UTC().Format(time.RFC3339)
	_, err := r.db.Exec(`
		UPDATE connections SET last_test_at=?, last_test_status=?, last_test_error_friendly=?, updated_at=? 
		WHERE id=?`,
		now, status, errorFriendly, now, id)
	return err
}