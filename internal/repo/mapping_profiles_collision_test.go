package repo

import (
	"testing"
)

func TestToFriendlyCollisionSingle(t *testing.T) {
	conflicts := []Conflict{
		{Table: "customers", ProfileID: "p1", ProfileName: "Sync Pelanggan"},
	}
	result := ToFriendlyCollision(conflicts)
	expected := "Tabel customers sudah dipakai profile \"Sync Pelanggan\". Dua profile tidak boleh menulis ke tabel Destination yang sama."
	if result != expected {
		t.Errorf("expected %q, got %q", expected, result)
	}
}

func TestToFriendlyCollisionMultiple(t *testing.T) {
	conflicts := []Conflict{
		{Table: "customers", ProfileID: "p1", ProfileName: "Profile A"},
		{Table: "orders", ProfileID: "p1", ProfileName: "Profile A"},
		{Table: "customers", ProfileID: "p2", ProfileName: "Profile B"},
	}
	result := ToFriendlyCollision(conflicts)
	if result == "" {
		t.Error("expected non-empty result")
	}
}

func TestToFriendlyCollisionEmpty(t *testing.T) {
	conflicts := []Conflict{}
	result := ToFriendlyCollision(conflicts)
	if result != "" {
		t.Errorf("expected empty, got %q", result)
	}
}

func TestConflictStr(t *testing.T) {
	c := Conflict{Table: "users", ProfileID: "p1", ProfileName: "My Profile"}
	result := conflictStr(c)
	expected := "Tabel users sudah dipakai profile \"My Profile\". Dua profile tidak boleh menulis ke tabel Destination yang sama."
	if result != expected {
		t.Errorf("expected %q, got %q", expected, result)
	}
}