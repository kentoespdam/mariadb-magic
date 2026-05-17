package api

import (
	"encoding/json"
	"testing"

	"magic-mariadb/internal/models"
	"magic-mariadb/internal/sync"
)

func TestSchemaResponseJSONKeysSnakeCase(t *testing.T) {
	resp := SchemaResponse{
		SourceSchema: map[string]models.TableSchema{
			"users": {
				"id":   {Name: "id", IsPK: true},
				"name": {Name: "name", Nullable: true},
			},
		},
		DestSchema: map[string]models.TableSchema{
			"users": {
				"id": {Name: "id", IsPK: true},
			},
		},
		Tables: []sync.TableWithRole{
			{Name: "users", Role: "source"},
		},
		AvailableTables: []string{"users", "orders"},
	}

	data, err := json.Marshal(resp)
	if err != nil {
		t.Fatalf("marshal failed: %v", err)
	}

	var parsed map[string]interface{}
	if err := json.Unmarshal(data, &parsed); err != nil {
		t.Fatalf("unmarshal failed: %v", err)
	}

	keys := []string{}
	for k := range parsed {
		keys = append(keys, k)
	}

	expectedKeys := []string{"source_schema", "dest_schema", "tables", "available_tables"}
	for _, expected := range expectedKeys {
		found := false
		for _, k := range keys {
			if k == expected {
				found = true
				break
			}
		}
		if !found {
			t.Errorf("expected snake_case key %q in response, got keys: %v", expected, keys)
		}
	}
}