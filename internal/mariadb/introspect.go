package mariadb

import (
	"context"
	"database/sql"
	"sync"
	"time"
)

type Introspector struct {
	db     *sql.DB
	cache  struct {
		data   Schema
		mu     sync.RWMutex
		at     time.Time
		ttl    time.Duration
	}
}

type Schema struct {
	Tables []TableSchema
}

type TableSchema struct {
	Name    string        `json:"name"`
	Columns []Column    `json:"columns"`
	PK      []string    `json:"pk"`
	FKs     []ForeignKey `json:"fks"`
}

type Column struct {
	Name         string `json:"name"`
	Type         string `json:"type"`
	Nullable    bool   `json:"nullable"`
	Default     *string `json:"default"`
	CharSet     string `json:"char_set"`
	Collation   string `json:"collation"`
}

type ForeignKey struct {
	ConstraintName      string   `json:"constraint_name"`
	Columns            []string `json:"columns"`
	ReferencedTable    string   `json:"referenced_table"`
	ReferencedColumns  []string `json:"referenced_columns"`
}

func NewIntrospector(db *sql.DB, ttlSeconds int) *Introspector {
	if ttlSeconds <= 0 {
		ttlSeconds = 30
	}
	i := &Introspector{db: db}
	i.cache.ttl = time.Duration(ttlSeconds) * time.Second
	return i
}

func (i *Introspector) GetSchema(ctx context.Context) (Schema, error) {
	i.cache.mu.RLock()
	if time.Since(i.cache.at) < i.cache.ttl {
		defer i.cache.mu.RUnlock()
		return i.cache.data, nil
	}
	i.cache.mu.RUnlock()

	i.cache.mu.Lock()
	defer i.cache.mu.Unlock()

	if time.Since(i.cache.at) < i.cache.ttl {
		return i.cache.data, nil
	}

	schema, err := i.loadSchema(ctx)
	if err != nil {
		return Schema{}, err
	}
	i.cache.data = schema
	i.cache.at = time.Now()
	return schema, nil
}

func timeSince(t time.Time) time.Duration {
	return time.Now().Sub(t)
}

func (i *Introspector) loadSchema(ctx context.Context) (Schema, error) {
	tables, err := i.tables(ctx)
	if err != nil {
		return Schema{}, err
	}

	for idx := range tables {
		columns, err := i.columns(ctx, tables[idx].Name)
		if err != nil {
			return Schema{}, err
		}
		tables[idx].Columns = columns

		pk, err := i.pkColumns(ctx, tables[idx].Name)
		if err != nil {
			return Schema{}, err
		}
		tables[idx].PK = pk

		fks, err := i.fkRelations(ctx, tables[idx].Name)
		if err != nil {
			return Schema{}, err
		}
		tables[idx].FKs = fks
	}

	return Schema{Tables: tables}, nil
}

func (i *Introspector) tables(ctx context.Context) ([]TableSchema, error) {
	rows, err := i.db.QueryContext(ctx, `
		SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES 
		WHERE TABLE_SCHEMA = DATABASE() AND TABLE_TYPE = 'BASE TABLE'
		ORDER BY TABLE_NAME`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var tables []TableSchema
	for rows.Next() {
		var name string
		if err := rows.Scan(&name); err != nil {
			return nil, err
		}
		tables = append(tables, TableSchema{Name: name})
	}
	return tables, rows.Err()
}

func (i *Introspector) columns(ctx context.Context, table string) ([]Column, error) {
	rows, err := i.db.QueryContext(ctx, `
		SELECT COLUMN_NAME, COLUMN_TYPE, IS_NULLABLE, COLUMN_DEFAULT, CHARACTER_SET_NAME, COLLATION_NAME
		FROM INFORMATION_SCHEMA.COLUMNS
		WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ?
		ORDER BY ORDINAL_POSITION`, table)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var cols []Column
	for rows.Next() {
		var c Column
		var nullable, defaultVal, charSet, coll *string
		if err := rows.Scan(&c.Name, &c.Type, &nullable, &defaultVal, &charSet, &coll); err != nil {
			return nil, err
		}
		c.Nullable = nullable != nil && *nullable == "YES"
		if defaultVal != nil {
			c.Default = defaultVal
		}
		if charSet != nil {
			c.CharSet = *charSet
		}
		if coll != nil {
			c.Collation = *coll
		}
		cols = append(cols, c)
	}
	return cols, rows.Err()
}

func (i *Introspector) pkColumns(ctx context.Context, table string) ([]string, error) {
	rows, err := i.db.QueryContext(ctx, `
		SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
		WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? AND CONSTRAINT_NAME = 'PRIMARY'
		ORDER BY ORDINAL_POSITION`, table)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var pk []string
	for rows.Next() {
		var col string
		if err := rows.Scan(&col); err != nil {
			return nil, err
		}
		pk = append(pk, col)
	}
	return pk, rows.Err()
}

func (i *Introspector) fkRelations(ctx context.Context, table string) ([]ForeignKey, error) {
	rows, err := i.db.QueryContext(ctx, `
		SELECT CONSTRAINT_NAME, kcu.COLUMN_NAME, kcu.REFERENCED_TABLE_NAME, kcu.REFERENCED_COLUMN_NAME
		FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS tc
		JOIN INFORMATION_SCHEMA.KEY_COLUMN_USAGE kcu 
			ON tc.CONSTRAINT_NAME = kcu.CONSTRAINT_NAME AND tc.TABLE_SCHEMA = kcu.TABLE_SCHEMA
		WHERE tc.TABLE_SCHEMA = DATABASE() AND tc.TABLE_NAME = ? 
			AND tc.CONSTRAINT_TYPE = 'FOREIGN KEY'
		ORDER BY tc.CONSTRAINT_NAME, kcu.ORDINAL_POSITION`, table)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	fkMap := make(map[string]*ForeignKey)
	var result []ForeignKey

	for rows.Next() {
		var fk ForeignKey
		var col, refCol string
		if err := rows.Scan(&fk.ConstraintName, &col, &fk.ReferencedTable, &refCol); err != nil {
			return nil, err
		}
		if existing, ok := fkMap[fk.ConstraintName]; ok {
			existing.Columns = append(existing.Columns, col)
			existing.ReferencedColumns = append(existing.ReferencedColumns, refCol)
		} else {
			fkMap[fk.ConstraintName] = &fk
			fk.Columns = []string{col}
			fk.ReferencedColumns = []string{refCol}
			result = append(result, fk)
		}
	}
	return result, rows.Err()
}

func (i *Introspector) Invalidate() {
	i.cache.mu.Lock()
	defer i.cache.mu.Unlock()
	i.cache.at = time.Time{}
}