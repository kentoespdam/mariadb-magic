package queries

import (
    "context"
    "database/sql"
    "errors"
    "fmt"
    "strings"
)

// GenerateInsert builds a SQLite INSERT statement with optional conflict handling.
// It returns the prepared statement string and a slice of arguments ready for sql.Exec.
// rows should be a slice of maps where each map represents a row: column name -> value.
// The function assumes all rows share the same columns (derived from the first row).
// Conflict handling: if the table has a primary key named "id", the generated
// statement includes an "ON CONFLICT(id) DO UPDATE SET ..." clause that updates all
// non‑primary‑key columns.
func GenerateInsert(ctx context.Context, db *sql.DB, table string, rows []map[string]interface{}) (string, []interface{}, error) {
    if len(rows) == 0 {
        return "", nil, errors.New("no rows provided")
    }
    if table == "" {
        return "", nil, errors.New("table name required")
    }

    // Validate columns against SQLite schema if possible.
    // If db is nil we skip validation.
    if db != nil {
        if err := validateColumns(ctx, db, table, rows[0]); err != nil {
            return "", nil, err
        }
    }

    // Determine column order from the first row to keep deterministic output.
    var cols []string
    for col := range rows[0] {
        cols = append(cols, col)
    }
    // Ensure deterministic order (sorted).
    for i := 0; i < len(cols)-1; i++ {
        for j := i + 1; j < len(cols); j++ {
            if cols[j] < cols[i] {
                cols[i], cols[j] = cols[j], cols[i]
            }
        }
    }

    placeholder := "?"
    var sb strings.Builder
    sb.WriteString("INSERT INTO ")
    sb.WriteString(table)
    sb.WriteString(" (")
    sb.WriteString(strings.Join(cols, ", "))
    sb.WriteString(") VALUES ")

    var args []interface{}
    for i, row := range rows {
        if i > 0 {
            sb.WriteString(", ")
        }
        sb.WriteString("(")
        for j, col := range cols {
            if j > 0 {
                sb.WriteString(", ")
            }
            sb.WriteString(placeholder)
            args = append(args, row[col])
        }
        sb.WriteString(")")
    }

    // Add conflict handling for primary key "id" if present.
    if _, ok := rows[0]["id"]; ok {
        sb.WriteString(" ON CONFLICT(id) DO UPDATE SET ")
        first := true
        for _, col := range cols {
            if col == "id" {
                continue // skip primary key
            }
            if !first {
                sb.WriteString(", ")
            }
            sb.WriteString(fmt.Sprintf("%s=excluded.%s", col, col))
            first = false
        }
    }

    return sb.String(), args, nil
}

