package queries

import (
    "context"
    "database/sql"
    "errors"
    "fmt"
    "strings"
)

// GenerateUpdate builds a SQLite UPDATE statement.
// updates maps column name to new value.
// where maps column name to value for the WHERE clause (AND combined).
// If where is nil or empty, no WHERE clause is added (updates all rows).
// Returns the prepared statement and arguments slice.
func GenerateUpdate(ctx context.Context, db *sql.DB, table string, updates map[string]interface{}, where map[string]interface{}) (string, []interface{}, error) {
    if table == "" {
        return "", nil, errors.New("table name required")
    }
    if len(updates) == 0 {
        return "", nil, errors.New("no updates provided")
    }

    // Validate columns if db is provided.
    if db != nil {
        sample := make(map[string]interface{})
        for k, v := range updates {
            sample[k] = v
        }
        for k, v := range where {
            sample[k] = v
        }
        if err := validateColumns(ctx, db, table, sample); err != nil {
            return "", nil, err
        }
    }

    // Collect columns and values in order, then sort by column name.
    type kv struct {
        col string
        val interface{}
    }
    var pairs []kv
    for col, val := range updates {
        pairs = append(pairs, kv{col, val})
    }
    // Sort by column name.
    for i := 0; i < len(pairs)-1; i++ {
        for j := i + 1; j < len(pairs); j++ {
            if pairs[j].col < pairs[i].col {
                pairs[i], pairs[j] = pairs[j], pairs[i]
            }
        }
    }

    var args []interface{}
    var setClauses []string
    for _, p := range pairs {
        setClauses = append(setClauses, fmt.Sprintf("%s=?", p.col))
        args = append(args, p.val)
    }

    var sb strings.Builder
    sb.WriteString("UPDATE ")
    sb.WriteString(table)
    sb.WriteString(" SET ")
    sb.WriteString(strings.Join(setClauses, ", "))

    if len(where) > 0 {
        sb.WriteString(" WHERE ")
        var conditions []string
        for col, val := range where {
            conditions = append(conditions, fmt.Sprintf("%s=?", col))
            args = append(args, val)
        }
        // Sort conditions by column name.
        for i := 0; i < len(conditions)-1; i++ {
            for j := i + 1; j < len(conditions); j++ {
                // Extract column name from condition (col=?).
                ci := strings.Index(conditions[i], "=")
                cj := strings.Index(conditions[j], "=")
                if cj >= 0 && ci >= 0 && conditions[j][:cj] < conditions[i][:ci] {
                    conditions[i], conditions[j] = conditions[j], conditions[i]
                }
            }
        }
        sb.WriteString(strings.Join(conditions, " AND "))
    }

    return sb.String(), args, nil
}
