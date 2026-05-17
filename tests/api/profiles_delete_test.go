package api_test

import (
	"net/http"
	"net/http/httptest"
	"testing"

	"magic-mariadb/internal/api"
	"magic-mariadb/internal/models"
	"magic-mariadb/internal/repo"
)

func TestDeleteProfileSafetyChecks(t *testing.T) {
	dbConn := newTestDB(t)
	h := api.NewProfilesHandler(dbConn, stubKey{}, nil)
	profilesRepo := repo.NewMappingProfilesRepo(dbConn)
	sessionsRepo := repo.NewSyncSessionsRepo(dbConn)

	// 1. Setup: Create a profile
	p := &models.MappingProfile{
		Name: "Test Profile",
		Status: "ready",
	}
	if err := profilesRepo.Create(p); err != nil {
		t.Fatalf("failed to create profile: %v", err)
	}

	// 2. Test: Delete non-existent profile (404)
	req := httptest.NewRequest("DELETE", "/api/profiles/999", nil)
	rec := httptest.NewRecorder()
	h.Delete(rec, req)
	if rec.Code != http.StatusNotFound {
		t.Errorf("expected 404 for non-existent profile, got %d", rec.Code)
	}

	// 3. Test: Delete existing draft/ready profile (204)
	req = httptest.NewRequest("DELETE", "/api/profiles/"+p.ID, nil)
	rec = httptest.NewRecorder()
	h.Delete(rec, req)
	if rec.Code != http.StatusNoContent {
		t.Errorf("expected 204 for ready profile delete, got %d body=%s", rec.Code, rec.Body.String())
	}

	// 4. Test: Delete active profile with running session (409)
	p2 := &models.MappingProfile{
		Name: "Active Profile",
	}
	if err := profilesRepo.Create(p2); err != nil {
		t.Fatalf("failed to create profile 2: %v", err)
	}
	p2.Status = "active"
	if err := profilesRepo.Update(p2); err != nil {
		t.Fatalf("failed to update profile 2 to active: %v", err)
	}
	
	// Create active session
	_, err := sessionsRepo.Create(p2.ID, *p2)
	if err != nil {
		t.Fatalf("failed to create active session: %v", err)
	}

	req = httptest.NewRequest("DELETE", "/api/profiles/"+p2.ID, nil)
	rec = httptest.NewRecorder()
	h.Delete(rec, req)
	if rec.Code != http.StatusConflict {
		t.Errorf("expected 409 for active profile delete, got %d body=%s", rec.Code, rec.Body.String())
	}
}
