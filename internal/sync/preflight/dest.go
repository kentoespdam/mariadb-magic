package preflight

import (
	"magic-mariadb/internal/mariadb"
	"magic-mariadb/internal/models"
)

func checkDestDrift(tables []string, schema mariadb.Schema, mappings models.ProfileMappings) []DriftItem {
	var items []DriftItem
	schemaMap := make(map[string]mariadb.TableSchema)
	for _, t := range schema.Tables {
		schemaMap[t.Name] = t
	}

	mappingsMap := make(map[string][]models.ColumnPairing)
	for _, tm := range mappings.Tables {
		mappingsMap[tm.TableName] = tm.ColumnPairs
	}

	for _, tableName := range tables {
		current, exists := schemaMap[tableName]
		if !exists {
			items = append(items, DriftItem{
				Table:   tableName,
				Message: "Tabel " + tableName + " tidak ditemukan di Destination",
			})
			continue
		}

		pairs := mappingsMap[tableName]
		currentCols := make(map[string]mariadb.Column)
		for _, c := range current.Columns {
			currentCols[c.Name] = c
		}

		currentPK := make(map[string]bool)
		for _, pk := range current.PK {
			currentPK[pk] = true
		}

		for _, p := range pairs {
			col, exists := currentCols[p.DestColumn]
			if !exists {
				items = append(items, DriftItem{
					Table:   tableName,
					Column:  p.DestColumn,
					Message: "Kolom paired " + tableName + "." + p.DestColumn + " tidak ditemukan",
				})
				continue
			}

			if p.IsPK && !currentPK[p.DestColumn] {
				items = append(items, DriftItem{
					Table:   tableName,
					Column:  p.DestColumn,
					Message: "Kolom PK " + tableName + "." + p.DestColumn + " hilang atau berubah",
				})
			}

			if p.SourceType == models.SourceTypeDefaultDB && col.Default == nil {
				items = append(items, DriftItem{
					Table:   tableName,
					Column:  p.DestColumn,
					Message: "Kolom " + tableName + "." + p.DestColumn + " kehilangan DEFAULT",
				})
			}
		}

		mappingColSet := make(map[string]bool)
		for _, p := range pairs {
			mappingColSet[p.DestColumn] = true
		}

		for _, c := range current.Columns {
			if mappingColSet[c.Name] {
				continue
			}
			if c.Default != nil {
				items = append(items, DriftItem{
					Table:   tableName,
					Column:  c.Name,
					Message: "Kolom baru " + tableName + "." + c.Name + " dengan DEFAULT",
				})
			} else if c.Nullable {
				items = append(items, DriftItem{
					Table:   tableName,
					Column:  c.Name,
					Message: "Kolom baru nullable " + tableName + "." + c.Name,
				})
			}
		}
	}
	return items
}