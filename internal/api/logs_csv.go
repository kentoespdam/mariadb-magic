package api

import (
	"encoding/csv"
	"fmt"
	"net/http"
	"strings"

	"magic-mariadb/internal/repo"
)

func (h *ProfilesHandler) ExportSessionLogsCSV(w http.ResponseWriter, r *http.Request, sessionID string) {
	codeStr := r.URL.Query().Get("mariadb_code")
	var code *int
	if codeStr != "" {
		c := 0
		if _, err := fmt.Sscanf(codeStr, "%d", &c); err == nil {
			code = &c
		}
	}

	profileID, err := h.runner.GetSession(sessionID)
	if err != nil || profileID == nil {
		WriteError(w, r, CodeNotFound, "session not found", nil, http.StatusNotFound)
		return
	}

	profileName := "profile"
	if ps := profileID.ProfileSnapshotJSON; len(ps) > 0 {
		if idx := strings.Index(string(ps), `"name":"`); idx > 0 {
			start := idx + 7
			end := start
			for end < len(ps) && ps[end] != '"' {
				end++
			}
			if end > start {
				profileName = string(ps[start:end])
			}
		}
	}

	slug := strings.ToLower(profileName)
	slug = strings.ReplaceAll(slug, " ", "-")
	if len(slug) > 40 {
		slug = slug[:40]
	}
	filename := fmt.Sprintf("magicsync-failures-%s-%s-%s.csv", sessionID[:8], slug, "2026-05-10")

	w.Header().Set("Content-Type", "text/csv; charset=utf-8")
	w.Header().Set("Content-Disposition", fmt.Sprintf("attachment; filename=%s", filename))

	w.Write([]byte{0xEF, 0xBB, 0xBF})

	writer := csv.NewWriter(w)
	writer.Comma = ';'
	writer.Write([]string{"waktu", "tabel_destination", "pk_baris", "kolom_bermasalah", "nilai_source", "kode_mariadb", "pesan_teknis", "pesan_ramah"})

	limit := 5000
	offset := 0
	for {
		var logs []repo.SyncLog
		if code != nil {
			logs, err = h.logsRepo.ListByCode(sessionID, *code, limit, offset)
		} else {
			logs, err = h.logsRepo.ListBySessionPaginated(sessionID, limit, offset)
		}
		if err != nil || len(logs) == 0 {
			break
		}

		for _, l := range logs {
			pk := "null"
			if l.PKJSON != nil && *l.PKJSON != "" {
				pk = *l.PKJSON
			}
			srcVal := "NULL"
			if l.SourceValue != nil && *l.SourceValue != "" {
				srcVal = *l.SourceValue
			}
			techMsg := ""
			if l.TechnicalMsg != nil {
				techMsg = *l.TechnicalMsg
			}
			friendlyMsg := ""
			if l.FriendlyMsg != nil {
				friendlyMsg = *l.FriendlyMsg
			}
			probCol := ""
			if l.ProblemColumn != nil {
				probCol = *l.ProblemColumn
			}

			writer.Write([]string{
				l.CreatedAt,
				l.DestinationTable,
				pk,
				probCol,
				srcVal,
				fmt.Sprintf("%d", l.MariaDBCode),
				techMsg,
				friendlyMsg,
			})
		}

		offset += limit
		if len(logs) < limit {
			break
		}
	}

	writer.Flush()
}
