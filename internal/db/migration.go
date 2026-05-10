package db

import (
	"embed"
	"fmt"
	"path/filepath"
	"strings"
)

//go:embed migrations/*.sql
var migrationsFS embed.FS

func readMigrations() ([]string, error) {
	entries, err := migrationsFS.ReadDir("migrations")
	if err != nil {
		return nil, err
	}
	var names []string
	for _, e := range entries {
		names = append(names, e.Name())
	}
	return names, nil
}

func readMigrationContent(filename string) (string, error) {
	content, err := migrationsFS.ReadFile("migrations/" + filename)
	if err != nil {
		return "", err
	}
	return string(content), nil
}

func extractVersion(filename string) int {
	base := filepath.Base(filename)
	num := strings.TrimPrefix(base, "0")
	num = strings.TrimSuffix(num, ".sql")
	var v int
	fmt.Sscanf(num, "%d", &v)
	return v
}
