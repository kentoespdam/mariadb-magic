package upsert

import (
	"fmt"
	"strings"

	"magic-mariadb/internal/models"
)

func buildInsertQuery(tableName string, mapping *models.TableMapping, pkCols []string) (query string, insertCols []string, updateCols []string) {
	insertCols = []string{}
	updateCols = []string{}

	for _, cp := range mapping.ColumnPairs {
		if cp.SourceType == models.SourceTypeSkip {
			continue
		}
		insertCols = append(insertCols, cp.DestColumn)
	}

	for _, cp := range mapping.ColumnPairs {
		if cp.SourceType == models.SourceTypeSkip {
			continue
		}
		switch cp.SourceType {
		case models.SourceTypeColumn:
			updateCols = append(updateCols, cp.DestColumn+" = ?")
		case models.SourceTypeConstant:
			updateCols = append(updateCols, cp.DestColumn+" = ?")
		case models.SourceTypeNull:
			updateCols = append(updateCols, cp.DestColumn+" = NULL")
		case models.SourceTypeDefaultDB:
			updateCols = append(updateCols, cp.DestColumn+" = DEFAULT("+cp.DestColumn+")")
		}
	}

	onDuplicate := ""
	if len(pkCols) > 0 {
		onDuplicate = " ON DUPLICATE KEY UPDATE " + strings.Join(updateCols, ", ")
	}

	colPlaceholders := make([]string, len(insertCols))
	for i := range colPlaceholders {
		colPlaceholders[i] = "?"
	}

	return fmt.Sprintf("INSERT INTO %s (%s) VALUES %%s%s",
		tableName,
		strings.Join(insertCols, ", "),
		onDuplicate,
	), insertCols, updateCols
}

func buildPlaceholders(colCount, rowCount int) string {
	colPlaceholders := make([]string, colCount)
	for i := range colPlaceholders {
		colPlaceholders[i] = "?"
	}
	rowStr := "(" + strings.Join(colPlaceholders, ", ") + ")"
	rows := make([]string, rowCount)
	for i := range rows {
		rows[i] = rowStr
	}
	return strings.Join(rows, ", ")
}
