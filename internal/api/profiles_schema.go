package api

import (
    "context"
    "fmt"
    "log"
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
        Password: password,
        DBName:   conn.Database,
        LocalZero: true,
    }

    db, err := cfg.Connect()
    if err != nil {
        return mariadb.Schema{}, fmt.Errorf("connection failed: %w", err)
    }
    defer db.Close()

    schema, err := mariadb.NewIntrospector(db, conn.Database, 0).GetSchema(context.Background())
    if err != nil {
        return mariadb.Schema{}, fmt.Errorf("schema introspection failed: %w", err)
    }

    log.Printf("introspected %d tables from %s.%s", len(schema.Tables), conn.Host, conn.Database)

    return schema, nil
}