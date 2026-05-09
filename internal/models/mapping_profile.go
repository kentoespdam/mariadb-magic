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
	ColumnPairingsJSON   json.RawMessage `json:"column_pairings_json,omitempty"`
	RulesJSON            json.RawMessage `json:"rules_json,omitempty"`
	Status               string          `json:"status"`
	CreatedAt            string          `json:"created_at"`
	UpdatedAt            string          `json:"updated_at"`
}

type TableSelection struct {
	Tables []string `json:"tables"`
}

type SourceValueType string

const (
	SourceTypeColumn    SourceValueType = "column"
	SourceTypeConstant  SourceValueType = "constant"
	SourceTypeNull      SourceValueType = "null"
	SourceTypeDefaultDB SourceValueType = "default_db"
	SourceTypeSkip     SourceValueType = "skip"
)

type ColumnPairing struct {
	DestColumn   string         `json:"dest_column"`
	IsPK         bool           `json:"is_pk"`
	SourceType   SourceValueType `json:"source_type"`
	SourceColumn string         `json:"source_column,omitempty"`
	ConstantVal  string         `json:"constant_val,omitempty"`
	Status       string         `json:"status"`
}

type TableMapping struct {
	TableName      string          `json:"table_name"`
	ColumnPairs    []ColumnPairing `json:"column_pairs"`
	UnresolvedCnt  int             `json:"unresolved_cnt"`
	TotalCols      int             `json:"total_cols"`
}

type ProfileMappings struct {
	Tables []TableMapping `json:"tables"`
}

type ColumnInfo struct {
	Name     string
	Nullable bool
	Default  *string
	IsPK     bool
}

type TableSchema map[string]ColumnInfo