package repo_test

import (
	"testing"

	"magic-mariadb/internal/repo"
)

func TestToFriendlyCollisionSingle(t *testing.T) {
	conflicts := []repo.Conflict{
		{Table: "customers", ProfileID: "p1", ProfileName: "Sync Pelanggan"},
	}
	result := repo.ToFriendlyCollision(conflicts)
	expected := `Tabel customers sudah dipakai profile "Sync Pelanggan". Dua profile tidak boleh menulis ke tabel Destination yang sama.`
	if result != expected {
		t.Errorf("expected %q, got %q", expected, result)
	}
}

func TestToFriendlyCollisionMultiple(t *testing.T) {
	conflicts := []repo.Conflict{
		{Table: "customers", ProfileID: "p1", ProfileName: "Profile A"},
		{Table: "orders", ProfileID: "p1", ProfileName: "Profile A"},
		{Table: "customers", ProfileID: "p2", ProfileName: "Profile B"},
	}
	result := repo.ToFriendlyCollision(conflicts)
	if result == "" {
		t.Error("expected non-empty result")
	}
}

func TestToFriendlyCollisionEmpty(t *testing.T) {
	conflicts := []repo.Conflict{}
	result := repo.ToFriendlyCollision(conflicts)
	if result != "" {
		t.Errorf("expected empty, got %q", result)
	}
}
