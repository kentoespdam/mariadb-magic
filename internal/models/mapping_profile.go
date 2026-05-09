package models

import (
	"encoding/json"
)

type MappingProfile struct {
	ID                    string          `json:"id"`
	Name                  string          `json:"name"`
	SourceConnectionID    string          `json:"source_connection_id"`
	DestinationConnectionID string        `json:"destination_connection_id"`
	SelectionJSON        json.RawMessage `json:"selection_json,omitempty"`
	RulesJSON            json.RawMessage `json:"rules_json,omitempty"`
	Status               string          `json:"status"`
	CreatedAt            string          `json:"created_at"`
	UpdatedAt            string          `json:"updated_at"`
}

type TableSelection struct {
	Tables []string `json:"tables"`
}