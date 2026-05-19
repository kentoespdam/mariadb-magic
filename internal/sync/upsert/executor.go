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
		rowValues := getRowValues(row, mapping, tableName, rulesMap)
		values = append(values, rowValues...)
	}

	_, err = tx.ExecContext(ctx, finalQuery, values...)
	if err != nil {
		// ADR-0003: Fallback ke per-row jika chunk gagal
		tx.Rollback()
		return execPerRow(ctx, destDB, tableName, mapping, pkCols, chunk, rulesMap, cfg)
	}

	if err := tx.Commit(); err != nil {
		return execPerRow(ctx, destDB, tableName, mapping, pkCols, chunk, rulesMap, cfg)
	}

	inserted = len(chunk)
	return
}

func execPerRow(ctx context.Context, destDB *sql.DB, tableName string, mapping *models.TableMapping, pkCols []string, chunk []map[string]any, rulesMap rules.RuleStore, cfg Config) (inserted, updated, failed int) {
	query, insertCols, _ := buildInsertQuery(tableName, mapping, pkCols)
	singlePlaceholder := buildPlaceholders(len(insertCols), 1)
	finalQuery := fmt.Sprintf(query, singlePlaceholder)

	for _, row := range chunk {
		values := getRowValues(row, mapping, tableName, rulesMap)
		_, err := destDB.ExecContext(ctx, finalQuery, values...)
		if err != nil {
			failed++
			if cfg.LogHook != nil {
				cfg.LogHook(tableName, 0, err)
			}
		} else {
			inserted++
		}
	}
	return
}

func getRowValues(row map[string]any, mapping *models.TableMapping, tableName string, rulesMap rules.RuleStore) []any {
	var values []any
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
	return values
}
