package api

import (
	"time"

	"magic-mariadb/internal/repo"
)

type CreateConnectionRequest struct {
	Name     string `json:"name"`
	Host     string `json:"host"`
	Port     int    `json:"port"`
	User     string `json:"user"`
	Password string `json:"password"`
	Database string `json:"database"`
}

type ConnectionResponse struct {
	ID               string     `json:"id"`
	Name             string     `json:"name"`
	Host             string     `json:"host"`
	Port             int        `json:"port"`
	User             string     `json:"user"`
	Database         string     `json:"database"`
	HasPassword      bool       `json:"has_password"`
	LastTestAt       *time.Time `json:"last_test_at,omitempty"`
	LastTestStatus   *string    `json:"last_test_status,omitempty"`
	LastTestError    *string    `json:"last_test_error_friendly,omitempty"`
	CreatedAt        string     `json:"created_at"`
	UpdatedAt        string     `json:"updated_at"`
}

func toConnectionResponse(c *repo.Connection) ConnectionResponse {
	return ConnectionResponse{
		ID:             c.ID,
		Name:           c.Name,
		Host:           c.Host,
		Port:           c.Port,
		User:           c.User,
		Database:       c.Database,
		HasPassword:    len(c.PasswordCiphertext) > 0,
		LastTestAt:     c.LastTestAt,
		LastTestStatus: c.LastTestStatus,
		LastTestError:  c.LastTestError,
		CreatedAt:      c.CreatedAt,
		UpdatedAt:      c.UpdatedAt,
	}
}