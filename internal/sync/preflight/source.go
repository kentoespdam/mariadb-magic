package preflight

import (
	"magic-mariadb/internal/mariadb"
	"magic-mariadb/internal/models"
)

func checkSourceDrift(tables []string, schema mariadb.Schema, mappings models.ProfileMappings) []DriftItem {
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
				Message: "Tabel Source " + tableName + " tidak ditemukan",
			})
			continue
		}

		pairs := mappingsMap[tableName]
		currentCols := make(map[string]mariadb.Column)
		for _, c := range current.Columns {
			currentCols[c.Name] = c
		}

		for _, p := range pairs {
			if p.SourceType != models.SourceTypeColumn || p.SourceColumn == "" {
				continue
			}
			if _, exists := currentCols[p.SourceColumn]; !exists {
				items = append(items, DriftItem{
					Table:   tableName,
					Column:  p.SourceColumn,
					Message: "Kolom Source " + tableName + "." + p.SourceColumn + " tidak ditemukan. Mungkin telah di-rename atau dihapus. Buka Mapping Profile dan pilih ulang sumber kolom.",
				})
			}
		}

		pairedSrcCols := make(map[string]bool)
		for _, p := range pairs {
			if p.SourceType == models.SourceTypeColumn {
				pairedSrcCols[p.SourceColumn] = true
			}
		}

		for _, c := range current.Columns {
			if pairedSrcCols[c.Name] {
				continue
			}
			items = append(items, DriftItem{
				Table:   tableName,
				Column:  c.Name,
				Message: "Kolom baru " + tableName + "." + c.Name + " tidak dipakai di Pairing",
			})
		}
	}
	return items
}
