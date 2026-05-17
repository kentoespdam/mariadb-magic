package sync

import (
	"encoding/json"
	"fmt"
	"sort"

	"magic-mariadb/internal/mariadb"
	"magic-mariadb/internal/models"
)

type TableWithRole struct {
	Name string `json:"name"`
	Role string `json:"role"`
}

type ClosureAdvisor struct{}

func NewClosureAdvisor() *ClosureAdvisor {
	return &ClosureAdvisor{}
}

func (c *ClosureAdvisor) ExpandFromSelection(selectionJSON json.RawMessage, sourceSchema, destSchema mariadb.Schema) ([]TableWithRole, error) {
	var sel models.TableSelection
	if len(selectionJSON) > 0 {
		if err := json.Unmarshal(selectionJSON, &sel); err != nil {
			return nil, fmt.Errorf("failed to unmarshal selection: %w", err)
		}
	}
	if len(sel.Tables) == 0 {
		return []TableWithRole{}, nil
	}
	return c.Expand(sel.Tables, sourceSchema, destSchema)
}

func (c *ClosureAdvisor) Expand(selection []string, sourceSchema, destSchema mariadb.Schema) ([]TableWithRole, error) {
	dag := c.buildDAG(sourceSchema, destSchema)
	selected := make(map[string]bool)
	for _, t := range selection {
		selected[t] = true
	}

	expanded := make(map[string]string)
	for _, t := range selection {
		if err := c.bfsExpand(t, dag, selected, expanded); err != nil {
			return nil, err
		}
	}

	if err := c.detectCycle(dag); err != nil {
		return nil, err
	}

	order, err := c.TopologicalSort(expanded, dag)
	if err != nil {
		return nil, err
	}

	var result []TableWithRole
	for _, t := range order {
		role := "advisor_added"
		if _, ok := selected[t]; ok {
			role = "user_selected"
		}
		result = append(result, TableWithRole{Name: t, Role: role})
	}
	return result, nil
}

func (c *ClosureAdvisor) buildDAG(sourceSchema, destSchema mariadb.Schema) map[string][]string {
	dag := make(map[string][]string)

	for _, ts := range []mariadb.Schema{sourceSchema, destSchema} {
		for _, t := range ts.Tables {
			if _, ok := dag[t.Name]; !ok {
				dag[t.Name] = nil
			}
			for _, fk := range t.FKs {
				dag[t.Name] = append(dag[t.Name], fk.ReferencedTable)
			}
		}
	}
	return dag
}

func (c *ClosureAdvisor) bfsExpand(start string, dag map[string][]string, selected map[string]bool, expanded map[string]string) error {
	visited := make(map[string]bool)
	queue := []string{start}

	for len(queue) > 0 {
		current := queue[0]
		queue = queue[1:]
		if visited[current] {
			continue
		}
		visited[current] = true
		expanded[current] = ""

		for _, parent := range dag[current] {
			if parent != "" {
				queue = append(queue, parent)
			}
		}
	}
	return nil
}

func (c *ClosureAdvisor) detectCycle(dag map[string][]string) error {
	visited := make(map[string]int)
	var dfs func(node string) error

	dfs = func(node string) error {
		visited[node] = 1
		for _, neighbor := range dag[node] {
			if neighbor == "" {
				continue
			}
			if visited[neighbor] == 1 {
				return fmt.Errorf("skema FK punya siklus, tidak bisa di-sync, hubungi admin Source")
			}
			if visited[neighbor] == 0 {
				if err := dfs(neighbor); err != nil {
					return err
				}
			}
		}
		visited[node] = 2
		return nil
	}

	for node := range dag {
		if visited[node] == 0 {
			if err := dfs(node); err != nil {
				return err
			}
		}
	}
	return nil
}

func (c *ClosureAdvisor) TopologicalSort(tables map[string]string, dag map[string][]string) ([]string, error) {
	inDegree := make(map[string]int)
	children := make(map[string][]string)

	for table := range tables {
		inDegree[table] = 0
		children[table] = []string{}
	}

	for table, parents := range dag {
		inDegree[table] = len(parents)
		for _, parent := range parents {
			if _, ok := children[parent]; ok {
				children[parent] = append(children[parent], table)
			}
		}
	}

	queue := make([]string, 0)
	for table, degree := range inDegree {
		if degree == 0 {
			queue = append(queue, table)
		}
	}

	var result []string
	for len(queue) > 0 {
		sort.Strings(queue)
		current := queue[0]
		queue = queue[1:]
		result = append(result, current)

		for _, child := range children[current] {
			inDegree[child]--
			if inDegree[child] == 0 {
				queue = append(queue, child)
			}
		}
	}

	if len(result) != len(tables) {
		return nil, fmt.Errorf("cycle detected")
	}
	return result, nil
}
