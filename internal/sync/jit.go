package sync

import (
    "database/sql"
    "fmt"
)

// JITParentSyncer handles just‑in‑time parent synchronization for a single table.
// It resolves missing foreign‑key parents recursively before inserting child rows.
// The implementation is minimal for the depth‑1 test case.

type JITParentSyncer struct {
    srcDB    *sql.DB
    dstDB    *sql.DB
    maxDepth int
    // visited tracks already synced parent primary keys per table to avoid loops.
    visited map[string]map[any]bool // table -> pk value -> true
}

func NewJITParentSyncer(src, dst *sql.DB) *JITParentSyncer {
    return &JITParentSyncer{
        srcDB:    src,
        dstDB:    dst,
        maxDepth: 10,
        visited:  make(map[string]map[any]bool),
    }
}

// SyncRows inserts the provided rows into dst, ensuring any foreign‑key parents are present.
func (s *JITParentSyncer) SyncRows(table string, rows []map[string]any) error {
    for _, row := range rows {
        if err := s.resolveParents(table, row, 0); err != nil {
            return err
        }
        if err := s.insertRow(table, row); err != nil {
            return err
        }
    }
    return nil
}

// resolveParents recursively resolves missing parents up to maxDepth.
func (s *JITParentSyncer) resolveParents(table string, row map[string]any, depth int) error {
    if depth > s.maxDepth {
        return fmt.Errorf("max recursion depth %d exceeded", s.maxDepth)
    }
    // Obtain foreign key metadata for the table via PRAGMA.
    fks, err := s.getForeignKeys(table)
    if err != nil {
        return err
    }
    for _, fk := range fks {
        childCol := fk.From
        parentTable := fk.Table
        parentCol := fk.To
        // Get the FK value from the child row.
        val, ok := row[childCol]
        if !ok || val == nil {
            continue // NULL FK – nothing to resolve.
        }
        // Check if parent already exists in destination.
        exists, err := s.rowExists(parentTable, parentCol, val)
        if err != nil {
            return err
        }
        if exists {
            continue
        }
        // Avoid re‑fetching the same parent.
        if s.isVisited(parentTable, val) {
            continue
        }
        // Fetch parent row from source.
        parentRow, err := s.fetchRow(parentTable, parentCol, val)
        if err != nil {
            return fmt.Errorf("failed to fetch parent %s(%v): %w", parentTable, val, err)
        }
        // Recurse to resolve any grandparents first.
        if err := s.resolveParents(parentTable, parentRow, depth+1); err != nil {
            return err
        }
        // Insert the parent row.
        if err := s.insertRow(parentTable, parentRow); err != nil {
            return err
        }
        s.markVisited(parentTable, val)
    }
    return nil
}

// ForeignKey holds minimal pragma information.
type ForeignKey struct {
    Id    int
    Seq   int
    Table string // parent table name
    From  string // child column name
    To    string // parent column name
    OnUpdate string
    OnDelete string
    Match string
}

func (s *JITParentSyncer) getForeignKeys(table string) ([]ForeignKey, error) {
    rows, err := s.srcDB.Query(fmt.Sprintf("PRAGMA foreign_key_list('%s')", table))
    if err != nil {
        return nil, err
    }
    defer rows.Close()
    var fks []ForeignKey
    for rows.Next() {
        var fk ForeignKey
        var id, seq int
        var tableName, from, to, onUpdate, onDelete, match string
        if err := rows.Scan(&id, &seq, &tableName, &from, &to, &onUpdate, &onDelete, &match); err != nil {
            return nil, err
        }
        fk = ForeignKey{Id: id, Seq: seq, Table: tableName, From: from, To: to, OnUpdate: onUpdate, OnDelete: onDelete, Match: match}
        fks = append(fks, fk)
    }
    return fks, nil
}

func (s *JITParentSyncer) rowExists(table, col string, val any) (bool, error) {
    var cnt int
    q := fmt.Sprintf("SELECT COUNT(1) FROM %s WHERE %s = ?", table, col)
    err := s.dstDB.QueryRow(q, val).Scan(&cnt)
    return cnt > 0, err
}

func (s *JITParentSyncer) fetchRow(table, col string, val any) (map[string]any, error) {
    // Query all columns for the row.
    rowMap := make(map[string]any)
    // First get column names.
    colsRows, err := s.srcDB.Query(fmt.Sprintf("PRAGMA table_info('%s')", table))
    if err != nil {
        return nil, err
    }
    defer colsRows.Close()
    var colNames []string
    for colsRows.Next() {
        var cid int
        var name, ctype string
        var notnull, pk int
        var dfltValue sql.NullString
        if err := colsRows.Scan(&cid, &name, &ctype, &notnull, &dfltValue, &pk); err != nil {
            return nil, err
        }
        colNames = append(colNames, name)
    }
    // Build SELECT.
    q := fmt.Sprintf("SELECT %s FROM %s WHERE %s = ?", join(colNames, ","), table, col)
    row := s.srcDB.QueryRow(q, val)
    // Prepare slice of interfaces for Scan.
    vals := make([]any, len(colNames))
    ptrs := make([]any, len(colNames))
    for i := range vals {
        ptrs[i] = &vals[i]
    }
    if err := row.Scan(ptrs...); err != nil {
        return nil, err
    }
    for i, name := range colNames {
        rowMap[name] = vals[i]
    }
    return rowMap, nil
}

func (s *JITParentSyncer) insertRow(table string, row map[string]any) error {
    var cols []string
    var placeholders []string
    var args []any
    for k, v := range row {
        cols = append(cols, k)
        placeholders = append(placeholders, "?")
        args = append(args, v)
    }
    stmt := fmt.Sprintf("INSERT INTO %s (%s) VALUES (%s)", table, join(cols, ","), join(placeholders, ","))
    _, err := s.dstDB.Exec(stmt, args...)
    return err
}

func (s *JITParentSyncer) isVisited(table string, pk any) bool {
    if m, ok := s.visited[table]; ok {
        return m[pk]
    }
    return false
}

func (s *JITParentSyncer) markVisited(table string, pk any) {
    if _, ok := s.visited[table]; !ok {
        s.visited[table] = make(map[any]bool)
    }
    s.visited[table][pk] = true
}

// join is a tiny helper to avoid strings.Join import.
func join(arr []string, sep string) string {
    out := ""
    for i, v := range arr {
        if i > 0 {
            out += sep
        }
        out += v
    }
    return out
}
