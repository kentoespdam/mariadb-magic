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

	// In this unit test, introspection fails (no real DB), 
	// so the softened validation in UpdatePairings allows the save.
	if rec.Code != http.StatusOK {
		t.Errorf("expected 200 for orphan table in pairings (introspection fails in unit test), got %d body=%s", rec.Code, rec.Body.String())
	}

	var resp map[string]interface{}
	json.Unmarshal(rec.Body.Bytes(), &resp)
	pResp := resp["profile"].(map[string]interface{})
	
	mappingsMap := pResp["column_pairings_json"].(map[string]interface{})
	tablesList := mappingsMap["tables"].([]interface{})

	foundOrphan := false
	for _, t := range tablesList {
		tm := t.(map[string]interface{})
		if tm["table_name"] == "orphans" {
			foundOrphan = true
			break
		}
	}

	if !foundOrphan {
		t.Errorf("expected 'orphans' table to be persisted in column_pairings_json")
	}
}
