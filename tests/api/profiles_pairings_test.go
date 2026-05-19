package api_test

import (
	"bytes"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"

	"magic-mariadb/internal/api"
	"magic-mariadb/internal/models"
	"magic-mariadb/internal/repo"
)

func TestUpdatePairingsOrphanTable(t *testing.T) {
	dbConn := newTestDB(t)
	h := api.NewProfilesHandler(dbConn, stubKey{}, nil)
	profilesRepo := repo.NewMappingProfilesRepo(dbConn)

	// 1. Setup: Create a profile with selection {users}
	sel := models.TableSelection{Tables: []string{"users"}}
	selBytes, _ := json.Marshal(sel)
	p := &models.MappingProfile{
		Name:          "Test Profile",
		SelectionJSON: selBytes,
		Status:        "draft",
	}
	if err := profilesRepo.Create(p); err != nil {
		t.Fatalf("failed to create profile: %v", err)
	}

	// 2. Test: Update pairings with orphan table {orphans}
	reqBody := api.UpdatePairingsRequest{
		ColumnPairingsJSON: `{"tables":[{"table_name":"users","column_pairs":[]},{"table_name":"orphans","column_pairs":[]}]}`,
		RulesJSON:          `{}`,
	}
	body, _ := json.Marshal(reqBody)
	req := httptest.NewRequest("POST", "/api/profiles/"+p.ID+"/pairings", bytes.NewBuffer(body))
	rec := httptest.NewRecorder()
	
	h.UpdatePairings(rec, req)

	if rec.Code != http.StatusBadRequest {
		t.Errorf("expected 400 for orphan table in pairings, got %d body=%s", rec.Code, rec.Body.String())
	}

	var errResp map[string]interface{}
	json.Unmarshal(rec.Body.Bytes(), &errResp)
	errBody := errResp["error"].(map[string]interface{})
	if errBody["code"] != "BAD_REQUEST" {
		t.Errorf("expected BAD_REQUEST error code, got %v", errBody["code"])
	}
}
