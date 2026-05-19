package repo_test

import (
	"testing"

	"magic-mariadb/internal/models"
	"magic-mariadb/internal/repo"
)

func strPtr(s string) *string {
	return &s
}

func TestValidateProfileForReady(t *testing.T) {
	tests := []struct {
		name            string
		mappings        models.ProfileMappings
		rules           map[string][]string
		destSchema      map[string]models.TableSchema
		selectionTables []string
		wantValid       bool
		wantErrs        []string
	}{
		{
			name: "valid mapping with all source columns",
			mappings: models.ProfileMappings{
				Tables: []models.TableMapping{
					{
						TableName: "users",
						ColumnPairs: []models.ColumnPairing{
							{DestColumn: "id", IsPK: true, SourceType: models.SourceTypeColumn, SourceColumn: "id", Status: "resolved"},
							{DestColumn: "name", IsPK: false, SourceType: models.SourceTypeColumn, SourceColumn: "name", Status: "resolved"},
						},
					},
				},
			},
			rules:           map[string][]string{},
			selectionTables: []string{"users"},
			destSchema: map[string]models.TableSchema{
				"users": {
					"id":   {Name: "id", Nullable: false, IsPK: true},
					"name": {Name: "name", Nullable: true, IsPK: false},
				},
			},
			wantValid: true,
			wantErrs:  nil,
		},
		{
			name: "selection table missing from mappings",
			mappings: models.ProfileMappings{
				Tables: []models.TableMapping{
					{
						TableName: "users",
						ColumnPairs: []models.ColumnPairing{
							{DestColumn: "id", IsPK: true, SourceType: models.SourceTypeColumn, SourceColumn: "id", Status: "resolved"},
						},
					},
				},
			},
			rules:           map[string][]string{},
			selectionTables: []string{"users", "orders", "order_items"},
			destSchema: map[string]models.TableSchema{
				"users":   {"id": {Name: "id", Nullable: false, IsPK: true}},
				"orders":  {"id": {Name: "id", Nullable: false, IsPK: true}},
				"order_items": {"id": {Name: "id", Nullable: false, IsPK: true}},
			},
			wantValid: false,
			wantErrs:  []string{"Tabel di selection belum punya column pairings", "Tabel di selection belum punya column pairings"},
		},
		{
			name: "table with unresolved columns",
			mappings: models.ProfileMappings{
				Tables: []models.TableMapping{
					{
						TableName:     "users",
						ColumnPairs:   []models.ColumnPairing{},
						UnresolvedCnt: 2,
						TotalCols:     3,
					},
				},
			},
			rules:           map[string][]string{},
			selectionTables: []string{"users"},
			destSchema: map[string]models.TableSchema{
				"users": {
					"id": {Name: "id", Nullable: false, IsPK: true},
				},
			},
			wantValid: false,
			wantErrs:  []string{"Tabel punya kolom yang belum di-resolve"},
		},
		{
			name: "PK not mapped to source column",
			mappings: models.ProfileMappings{
				Tables: []models.TableMapping{
					{
						TableName: "users",
						ColumnPairs: []models.ColumnPairing{
							{DestColumn: "id", IsPK: true, SourceType: models.SourceTypeNull, Status: "resolved"},
						},
					},
				},
			},
			rules:           map[string][]string{},
			selectionTables: []string{"users"},
			destSchema: map[string]models.TableSchema{
				"users": {
					"id": {Name: "id", Nullable: false, IsPK: true},
				},
			},
			wantValid: false,
			wantErrs:  []string{"PK wajib di-pair ke Source Column", "Kolom NOT NULL tanpa default tidak boleh Kosongkan/NULL atau Lewati"},
		},
		{
			name: "PK mapped to constant",
			mappings: models.ProfileMappings{
				Tables: []models.TableMapping{
					{
						TableName: "users",
						ColumnPairs: []models.ColumnPairing{
							{DestColumn: "id", IsPK: true, SourceType: models.SourceTypeConstant, ConstantVal: "1", Status: "resolved"},
						},
					},
				},
			},
			rules: map[string][]string{},
			destSchema: map[string]models.TableSchema{
				"users": {
					"id": {Name: "id", Nullable: false, IsPK: true},
				},
			},
			wantValid: false,
			wantErrs:  []string{"PK wajib di-pair ke Source Column"},
		},
		{
			name: "PK mapped to skip",
			mappings: models.ProfileMappings{
				Tables: []models.TableMapping{
					{
						TableName: "users",
						ColumnPairs: []models.ColumnPairing{
							{DestColumn: "id", IsPK: true, SourceType: models.SourceTypeSkip, Status: "resolved"},
						},
					},
				},
			},
			rules:           map[string][]string{},
			selectionTables: []string{"users"},
			destSchema: map[string]models.TableSchema{
				"users": {
					"id": {Name: "id", Nullable: false, IsPK: true},
				},
			},
			wantValid: false,
			wantErrs:  []string{"PK wajib di-pair ke Source Column", "Kolom NOT NULL tanpa default tidak boleh Kosongkan/NULL atau Lewati"},
		},
		{
			name: "PK has rule",
			mappings: models.ProfileMappings{
				Tables: []models.TableMapping{
					{
						TableName: "users",
						ColumnPairs: []models.ColumnPairing{
							{DestColumn: "id", IsPK: true, SourceType: models.SourceTypeColumn, SourceColumn: "id", Status: "resolved"},
						},
					},
				},
			},
			rules:           map[string][]string{"users": {"id"}},
			selectionTables: []string{"users"},
			destSchema: map[string]models.TableSchema{
				"users": {
					"id": {Name: "id", Nullable: false, IsPK: true},
				},
			},
			wantValid: false,
			wantErrs:  []string{"PK tidak boleh punya Rule"},
		},
		{
			name: "NOT NULL no-default with NULL source",
			mappings: models.ProfileMappings{
				Tables: []models.TableMapping{
					{
						TableName: "users",
						ColumnPairs: []models.ColumnPairing{
							{DestColumn: "id", IsPK: true, SourceType: models.SourceTypeColumn, SourceColumn: "id", Status: "resolved"},
							{DestColumn: "email", IsPK: false, SourceType: models.SourceTypeNull, Status: "resolved"},
						},
					},
				},
			},
			rules:           map[string][]string{},
			selectionTables: []string{"users"},
			destSchema: map[string]models.TableSchema{
				"users": {
					"id":    {Name: "id", Nullable: false, IsPK: true},
					"email": {Name: "email", Nullable: false, Default: nil, IsPK: false},
				},
			},
			wantValid: false,
			wantErrs:  []string{"Kolom NOT NULL tanpa default tidak boleh Kosongkan/NULL atau Lewati"},
		},
		{
			name: "NOT NULL no-default with skip",
			mappings: models.ProfileMappings{
				Tables: []models.TableMapping{
					{
						TableName: "users",
						ColumnPairs: []models.ColumnPairing{
							{DestColumn: "id", IsPK: true, SourceType: models.SourceTypeColumn, SourceColumn: "id", Status: "resolved"},
							{DestColumn: "email", IsPK: false, SourceType: models.SourceTypeSkip, Status: "resolved"},
						},
					},
				},
			},
			rules:           map[string][]string{},
			selectionTables: []string{"users"},
			destSchema: map[string]models.TableSchema{
				"users": {
					"id":    {Name: "id", Nullable: false, IsPK: true},
					"email": {Name: "email", Nullable: false, Default: nil, IsPK: false},
				},
			},
			wantValid: false,
			wantErrs:  []string{"Kolom NOT NULL tanpa default tidak boleh Kosongkan/NULL atau Lewati"},
		},
		{
			name: "NOT NULL with default can be skipped",
			mappings: models.ProfileMappings{
				Tables: []models.TableMapping{
					{
						TableName: "users",
						ColumnPairs: []models.ColumnPairing{
							{DestColumn: "id", IsPK: true, SourceType: models.SourceTypeColumn, SourceColumn: "id", Status: "resolved"},
							{DestColumn: "created_at", IsPK: false, SourceType: models.SourceTypeSkip, Status: "resolved"},
						},
					},
				},
			},
			rules:           map[string][]string{},
			selectionTables: []string{"users"},
			destSchema: map[string]models.TableSchema{
				"users": {
					"id":         {Name: "id", Nullable: false, IsPK: true},
					"created_at": {Name: "created_at", Nullable: false, Default: strPtr("CURRENT_TIMESTAMP"), IsPK: false},
				},
			},
			wantValid: true,
			wantErrs:  nil,
		},
		{
			name: "nullable column can be null",
			mappings: models.ProfileMappings{
				Tables: []models.TableMapping{
					{
						TableName: "users",
						ColumnPairs: []models.ColumnPairing{
							{DestColumn: "id", IsPK: true, SourceType: models.SourceTypeColumn, SourceColumn: "id", Status: "resolved"},
							{DestColumn: "bio", IsPK: false, SourceType: models.SourceTypeNull, Status: "resolved"},
						},
					},
				},
			},
			rules:           map[string][]string{},
			selectionTables: []string{"users"},
			destSchema: map[string]models.TableSchema{
				"users": {
					"id":  {Name: "id", Nullable: false, IsPK: true},
					"bio": {Name: "bio", Nullable: true, IsPK: false},
				},
			},
			wantValid: true,
			wantErrs:  nil,
		},
		{
			name: "NOT NULL with default cannot be null",
			mappings: models.ProfileMappings{
				Tables: []models.TableMapping{
					{
						TableName: "users",
						ColumnPairs: []models.ColumnPairing{
							{DestColumn: "id", IsPK: true, SourceType: models.SourceTypeColumn, SourceColumn: "id", Status: "resolved"},
							{DestColumn: "status", IsPK: false, SourceType: models.SourceTypeNull, Status: "resolved"},
						},
					},
				},
			},
			rules:           map[string][]string{},
			selectionTables: []string{"users"},
			destSchema: map[string]models.TableSchema{
				"users": {
					"id":     {Name: "id", Nullable: false, IsPK: true},
					"status": {Name: "status", Nullable: false, Default: strPtr("active"), IsPK: false},
				},
			},
			wantValid: false,
			wantErrs:  []string{"Kolom NOT NULL tidak boleh diset NULL"},
		},
		{
			name: "multiple errors",
			mappings: models.ProfileMappings{
				Tables: []models.TableMapping{
					{
						TableName: "users",
						ColumnPairs: []models.ColumnPairing{
							{DestColumn: "id", IsPK: true, SourceType: models.SourceTypeNull, Status: "resolved"},
							{DestColumn: "email", IsPK: false, SourceType: models.SourceTypeNull, Status: "resolved"},
						},
					},
				},
			},
			rules:           map[string][]string{"users": {"id"}},
			selectionTables: []string{"users"},
			destSchema: map[string]models.TableSchema{
				"users": {
					"id":    {Name: "id", Nullable: false, IsPK: true},
					"email": {Name: "email", Nullable: false, Default: nil, IsPK: false},
				},
			},
			wantValid: false,
			wantErrs: []string{
				"PK wajib di-pair ke Source Column",
				"PK tidak boleh punya Rule",
				"Kolom NOT NULL tanpa default tidak boleh Kosongkan/NULL atau Lewati",
				"Kolom NOT NULL tanpa default tidak boleh Kosongkan/NULL atau Lewati",
			},
		},
		{
			name: "constant value is valid for PK",
			mappings: models.ProfileMappings{
				Tables: []models.TableMapping{
					{
						TableName: "users",
						ColumnPairs: []models.ColumnPairing{
							{DestColumn: "id", IsPK: true, SourceType: models.SourceTypeConstant, ConstantVal: "123", Status: "resolved"},
						},
					},
				},
			},
			rules:           map[string][]string{},
			selectionTables: []string{"users"},
			destSchema: map[string]models.TableSchema{
				"users": {
					"id": {Name: "id", Nullable: false, IsPK: true},
				},
			},
			wantValid: false,
			wantErrs:  []string{"PK wajib di-pair ke Source Column"},
		},
		{
			name: "default_db is valid for non-PK nullable",
			mappings: models.ProfileMappings{
				Tables: []models.TableMapping{
					{
						TableName: "users",
						ColumnPairs: []models.ColumnPairing{
							{DestColumn: "id", IsPK: true, SourceType: models.SourceTypeColumn, SourceColumn: "id", Status: "resolved"},
							{DestColumn: "bio", IsPK: false, SourceType: models.SourceTypeDefaultDB, Status: "resolved"},
						},
					},
				},
			},
			rules:           map[string][]string{},
			selectionTables: []string{"users"},
			destSchema: map[string]models.TableSchema{
				"users": {
					"id":  {Name: "id", Nullable: false, IsPK: true},
					"bio": {Name: "bio", Nullable: true, IsPK: false},
				},
			},
			wantValid: true,
			wantErrs:  nil,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			result := repo.ValidateProfileForReady(tt.mappings, tt.rules, tt.destSchema, tt.selectionTables)
			if result.Valid != tt.wantValid {
				t.Errorf("ValidateProfileForReady() valid = %v, want %v", result.Valid, tt.wantValid)
			}
			if len(result.Errors) != len(tt.wantErrs) {
				t.Errorf("ValidateProfileForReady() errors = %v, want %v", result.Errors, tt.wantErrs)
				return
			}
			for i, err := range result.Errors {
				if err.Message != tt.wantErrs[i] {
					t.Errorf("ValidateProfileForReady() error[%d] = %v, want %v", i, err.Message, tt.wantErrs[i])
				}
			}
		})
	}
}
