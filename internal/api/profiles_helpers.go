package api

import (
    "magic-mariadb/internal/mariadb"
    "magic-mariadb/internal/models"
)

func modelSchemaFromMaria(ms mariadb.Schema) models.TableSchema {
    result := make(models.TableSchema)
    if len(ms.Tables) == 0 {
        return result
    }
    for _, t := range ms.Tables {
        for _, col := range t.Columns {
            result[col.Name] = models.ColumnInfo{
                Name:     col.Name,
                Nullable:   col.Nullable,
                Default:  col.Default,
                IsPK:     isPK(col.Name, t.PK),
            }
        }
        break
    }
    return result
}

func modelSchemaMapFromMaria(ms mariadb.Schema) map[string]models.TableSchema {
    result := make(map[string]models.TableSchema)
    for _, t := range ms.Tables {
        schema := make(models.TableSchema)
        for _, col := range t.Columns {
            schema[col.Name] = models.ColumnInfo{
                Name:     col.Name,
                Nullable: col.Nullable,
                Default:  col.Default,
                IsPK:     isPK(col.Name, t.PK),
            }
        }
        result[t.Name] = schema
    }
    return result
}

func isPK(colName string, pk []string) bool {
    for _, p := range pk {
        if p == colName {
            return true
        }
    }
    return false
}