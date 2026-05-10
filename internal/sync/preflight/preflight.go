package preflight

import (
	"context"
	"database/sql"
	"encoding/json"
	"fmt"
	"strings"

	"magic-mariadb/internal/mariadb"
	"magic-mariadb/internal/models"
)

type DriftReport struct {
	BlockingDest    []DriftItem `json:"blocking_dest"`
	BlockingSource  []DriftItem `json:"blocking_source"`
	AutoHandledDest []DriftItem `json:"auto_handled_dest"`
	AutoHandledSrc  []DriftItem `json:"auto_handled_src"`
}

type DriftItem struct {
	Table   string `json:"table"`
	Column  string `json:"column,omitempty"`
	Message string `json:"message"`
}

func Preflight(
	ctx context.Context,
	profile models.MappingProfile,
	srcDB, destDB *sql.DB,
) (*DriftReport, error) {
	report := &DriftReport{}

	srcSchema, err := getSchema(ctx, srcDB)
	if err != nil {
		return nil, fmt.Errorf("source schema: %w", err)
	}
	destSchema, err := getSchema(ctx, destDB)
	if err != nil {
		return nil, fmt.Errorf("dest schema: %w", err)
	}

	var selection models.TableSelection
	if err := json.Unmarshal(profile.SelectionJSON, &selection); err != nil {
		return nil, fmt.Errorf("parse selection: %w", err)
	}

	var mappings models.ProfileMappings
	if len(profile.ColumnPairingsJSON) > 0 {
		json.Unmarshal(profile.ColumnPairingsJSON, &mappings)
	}

	report.BlockingDest = checkDestDrift(selection.Tables, destSchema, mappings)
	report.BlockingSource = checkSourceDrift(selection.Tables, srcSchema, mappings)

	return report, nil
}

func getSchema(ctx context.Context, db *sql.DB) (mariadb.Schema, error) {
	return mariadb.NewIntrospector(db, 0).GetSchema(ctx)
}

func (r *DriftReport) HasBlocking() bool {
	return len(r.BlockingDest) > 0 || len(r.BlockingSource) > 0
}

func ToFriendlyDrift(r *DriftReport) string {
	if !r.HasBlocking() {
		return ""
	}
	var parts []string
	for _, d := range r.BlockingDest {
		parts = append(parts, d.Message)
	}
	for _, d := range r.BlockingSource {
		parts = append(parts, d.Message)
	}
	return strings.Join(parts, "\n")
}