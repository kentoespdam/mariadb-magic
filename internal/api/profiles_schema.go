package api

import (
    "context"
    "fmt"
    "magic-mariadb/internal/mariadb"
)

// getMariaDBSchema retrieves schema from MariaDB connection
func (h *ProfilesHandler) getMariaDBSchema(connID string) (mariadb.Schema, error) {
    conn, err := h.repo.GetConnection(connID)
    if err != nil || conn == nil {
        return mariadb.Schema{}, fmt.Errorf("connection not found")
    }

    password, err := h.decryptPassword(conn.PasswordCiphertext)
    if err != nil {
        return mariadb.Schema{}, fmt.Errorf("failed to decrypt password: %w", err)
    }

    cfg := mariadb.Config{
        Host:     conn.Host,
        Port:     conn.Port,
        User:     conn.User,
        Password:   password,
    }

    db, err := cfg.Connect()
    if err != nil {
        return mariadb.Schema{}, err
    }
    defer db.Close()

    ctx := context.Background()
    schema, err := mariadb.NewIntrospector(db, 30).GetSchema(ctx)
    if err != nil {
        return mariadb.Schema{}, err
    }

    return schema, nil
}