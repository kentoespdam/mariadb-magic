package upsert

import (
	"context"
	"database/sql"
	"encoding/json"

	"magic-mariadb/internal/mariadb"
	"magic-mariadb/internal/models"
	"magic-mariadb/internal/rules"
)

const DefaultChunkSize = 500

type Config struct {
	ChunkSize int
	LogHook   func(table string, row int, err error)
}

type Result struct {
	Table      string
	Inserted   int
	Updated    int
	Failed     int
	ChunkCount int
	Errors     []string
}

type UpsertFunc func(ctx context.Context, srcDB, destDB *sql.DB, profile models.MappingProfile, tables []mariadb.TableSchema, destSchema map[string]models.TableSchema) ([]Result, error)

func New(cfg Config) UpsertFunc {
	if cfg.ChunkSize <= 0 {
		cfg.ChunkSize = DefaultChunkSize
	}
	return func(ctx context.Context, srcDB, destDB *sql.DB, profile models.MappingProfile, tables []mariadb.TableSchema, destSchema map[string]models.TableSchema) ([]Result, error) {
		return execute(ctx, srcDB, destDB, profile, tables, destSchema, cfg)
	}
}

func execute(ctx context.Context, srcDB, destDB *sql.DB, profile models.MappingProfile, tables []mariadb.TableSchema, destSchema map[string]models.TableSchema, cfg Config) ([]Result, error) {
	var mappings models.ProfileMappings
	if len(profile.ColumnPairingsJSON) > 0 {
		json.Unmarshal(profile.ColumnPairingsJSON, &mappings)
	}

	var rulesMap rules.RuleStore
	if len(profile.RulesJSON) > 0 {
		json.Unmarshal(profile.RulesJSON, &rulesMap)
	}

	var results []Result
	for _, table := range tables {
		result := processTable(ctx, srcDB, destDB, table.Name, mappings, rulesMap, destSchema, cfg)
		results = append(results, result)
	}
	return results, nil
}

func processTable(ctx context.Context, srcDB, destDB *sql.DB, tableName string, mappings models.ProfileMappings, rulesMap rules.RuleStore, destSchema map[string]models.TableSchema, cfg Config) Result {
	result := Result{Table: tableName}

	mapping := findMapping(mappings, tableName)
	if mapping == nil {
		result.Errors = append(result.Errors, "no mapping found")
		return result
	}

	tableSchema, ok := destSchema[tableName]
	if !ok {
		result.Errors = append(result.Errors, "no dest schema")
		return result
	}

	pkCols := findPKCols(mapping, tableSchema)
	if len(pkCols) == 0 {
		result.Errors = append(result.Errors, "no PK found")
		return result
	}

	result = collectAndSync(ctx, srcDB, destDB, tableName, mapping, pkCols, rulesMap, cfg, result)
	return result
}

func collectAndSync(ctx context.Context, srcDB, destDB *sql.DB, tableName string, mapping *models.TableMapping, pkCols []string, rulesMap rules.RuleStore, cfg Config, result Result) Result {
	rows, err := srcDB.QueryContext(ctx, "SELECT * FROM "+tableName)
	if err != nil {
		result.Errors = append(result.Errors, err.Error())
		return result
	}
	defer rows.Close()

	data, err := scanRows(rows)
	if err != nil {
		result.Errors = append(result.Errors, err.Error())
		return result
	}

	for i := 0; i < len(data); i += cfg.ChunkSize {
		end := i + cfg.ChunkSize
		if end > len(data) {
			end = len(data)
		}
		chunk := data[i:end]
		ins, upd, fail := execChunk(ctx, destDB, tableName, mapping, pkCols, chunk, rulesMap, cfg)
		result.Inserted += ins
		result.Updated += upd
		result.Failed += fail
		result.ChunkCount++
	}
	return result
}

func findMapping(mappings models.ProfileMappings, tableName string) *models.TableMapping {
	for i := range mappings.Tables {
		if mappings.Tables[i].TableName == tableName {
			return &mappings.Tables[i]
		}
	}
	return nil
}

func findPKCols(mapping *models.TableMapping, tableSchema models.TableSchema) []string {
	var pkCols []string
	for _, cp := range mapping.ColumnPairs {
		if cp.IsPK {
			if _, ok := tableSchema[cp.DestColumn]; ok {
				pkCols = append(pkCols, cp.DestColumn)
			}
		}
	}
	return pkCols
}