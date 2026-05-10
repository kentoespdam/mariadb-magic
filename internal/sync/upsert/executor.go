package upsert

import (
	"context"
	"database/sql"
	"fmt"

	"magic-mariadb/internal/models"
	"magic-mariadb/internal/rules"
)

func execChunk(ctx context.Context, destDB *sql.DB, tableName string, mapping *models.TableMapping, pkCols []string, chunk []map[string]any, rulesMap rules.RuleStore, cfg Config) (inserted, updated, failed int) {
	if len(chunk) == 0 {
		return
	}

	tx, err := destDB.BeginTx(ctx, nil)
	if err != nil {
		failed = len(chunk)
		return
	}
	defer tx.Rollback()

	query, insertCols, _ := buildInsertQuery(tableName, mapping, pkCols)
	placeholders := buildPlaceholders(len(insertCols), len(chunk))

	finalQuery := fmt.Sprintf(query, placeholders)

	var values []any
	for _, row := range chunk {
		for _, cp := range mapping.ColumnPairs {
			if cp.SourceType == models.SourceTypeSkip {
				continue
			}
			var val any
			switch cp.SourceType {
			case models.SourceTypeColumn:
				val = row[cp.SourceColumn]
				if tableRules, ok := rulesMap[tableName]; ok {
					if rule, ok := tableRules[cp.DestColumn]; ok {
						val, _ = rules.TranslateToFunc(rule)(val)
					}
				}
			case models.SourceTypeConstant:
				val = cp.ConstantVal
			case models.SourceTypeNull, models.SourceTypeDefaultDB:
				val = nil
			}
			values = append(values, val)
		}
	}

	_, err = tx.ExecContext(ctx, finalQuery, values...)
	if err != nil {
		failed = len(chunk)
		if cfg.LogHook != nil {
			cfg.LogHook(tableName, 0, err)
		}
		return
	}

	if err := tx.Commit(); err != nil {
		failed = len(chunk)
		return
	}

	inserted = len(chunk)
	return
}
