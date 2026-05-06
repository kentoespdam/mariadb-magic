package queries

import (
    "context"
    "database/sql"
    "fmt"
)

// validateColumns checks that the keys in the sample row exist in the SQLite table schema.
func validateColumns(ctx context.Context, db *sql.DB, table string, sample map[string]interface{}) error {
    rows, err := db.QueryContext(ctx, fmt.Sprintf("PRAGMA table_info(%s)", table))
    if err != nil {
        return fmt.Errorf("cannot query schema for %s: %w", table, err)
    }
    defer rows.Close()

    colSet := make(map[string]struct{})
    for rows.Next() {
        var cid int
        var name string
        var ctype string
        var notnull int
        var dfltValue interface{}
        var pk int
        if err := rows.Scan(&cid, &name, &ctype, &notnull, &dfltValue, &pk); err != nil {
            return err
        }
        colSet[name] = struct{}{}
    }
    if err := rows.Err(); err != nil {
        return err
    }

    for col := range sample {
        if _, ok := colSet[col]; !ok {
            return fmt.Errorf("column %s does not exist in table %s", col, table)
        }
    }
    return nil
}
