package sync_test

import (
	"testing"

	"magic-mariadb/internal/mariadb"
	"magic-mariadb/internal/sync"
)

func TestClosureAdvisorTopologicalSort(t *testing.T) {
	tests := []struct {
		name      string
		tables    []string
		dag       map[string][]string
		wantErr   bool
		wantOrder []string
	}{
		{
			name:      "empty",
			tables:    []string{},
			dag:       map[string][]string{},
			wantErr:   false,
			wantOrder: []string{},
		},
		{
			name:      "single table",
			tables:    []string{"users"},
			dag:       map[string][]string{"users": {}},
			wantErr:   false,
			wantOrder: []string{"users"},
		},
		{
			name:    "no dependencies",
			tables:  []string{"users", "orders", "products"},
			dag:     map[string][]string{"users": {}, "orders": {}, "products": {}},
			wantErr: false,
		},
		{
			name:      "linear chain users -> posts -> comments",
			tables:    []string{"comments", "posts", "users"},
			dag:       map[string][]string{"comments": {"posts"}, "posts": {"users"}, "users": {}},
			wantErr:   false,
			wantOrder: []string{"users", "posts", "comments"},
		},
		{
			name:      "diamond dependency",
			tables:    []string{"d", "c", "b", "a"},
			dag:       map[string][]string{"d": {"b", "c"}, "c": {"a"}, "b": {"a"}, "a": {}},
			wantErr:   false,
			wantOrder: []string{"a", "b", "c", "d"},
		},
		{
			name:    "multiple roots",
			tables:  []string{"b", "a", "c"},
			dag:     map[string][]string{"b": {"a"}, "a": {}, "c": {}},
			wantErr: false,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			ca := &sync.ClosureAdvisor{}
			expanded := make(map[string]string)
			for _, t := range tt.tables {
				expanded[t] = ""
			}
			order, err := ca.TopologicalSort(expanded, tt.dag)
			if (err != nil) != tt.wantErr {
				t.Errorf("TopologicalSort() error = %v, wantErr %v", err, tt.wantErr)
				return
			}
			if tt.wantOrder != nil && len(order) != len(tt.wantOrder) {
				t.Errorf("TopologicalSort() order = %v, want %v", order, tt.wantOrder)
			}
			if tt.wantOrder != nil {
				for i, want := range tt.wantOrder {
					if i >= len(order) || order[i] != want {
						t.Errorf("TopologicalSort() order[%d] = %v, want %v", i, order[i], want)
					}
				}
			}
		})
	}
}

func TestClosureAdvisorExpand(t *testing.T) {
	tests := []struct {
		name         string
		selection    []string
		sourceSchema mariadb.Schema
		destSchema   mariadb.Schema
		wantTables   int
		wantErr      bool
	}{
		{
			name:         "empty selection",
			selection:    []string{},
			sourceSchema: mariadb.Schema{},
			destSchema:   mariadb.Schema{},
			wantTables:   0,
			wantErr:      false,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			ca := &sync.ClosureAdvisor{}
			result, err := ca.Expand(tt.selection, tt.sourceSchema, tt.destSchema)
			if (err != nil) != tt.wantErr {
				t.Errorf("Expand() error = %v, wantErr %v", err, tt.wantErr)
				return
			}
			if len(result) != tt.wantTables {
				t.Errorf("Expand() got %d tables, want %d", len(result), tt.wantTables)
			}
		})
	}
}