package preflight_test

import (
	"testing"

	"magic-mariadb/internal/sync/preflight"
)

func TestDriftReport_IsReadyEligible(t *testing.T) {
	tests := []struct {
		name     string
		report   preflight.DriftReport
		expected bool
	}{
		{
			name: "no blocking - eligible",
			report: preflight.DriftReport{
				BlockingDest:   []preflight.DriftItem{},
				BlockingSource: []preflight.DriftItem{},
			},
			expected: true,
		},
		{
			name: "has blocking dest - not eligible",
			report: preflight.DriftReport{
				BlockingDest:   []preflight.DriftItem{{Table: "users", Message: "extra column"}},
				BlockingSource: []preflight.DriftItem{},
			},
			expected: false,
		},
		{
			name: "has blocking source - not eligible",
			report: preflight.DriftReport{
				BlockingDest:   []preflight.DriftItem{},
				BlockingSource: []preflight.DriftItem{{Table: "orders", Message: "missing column"}},
			},
			expected: false,
		},
		{
			name: "both blocking - not eligible",
			report: preflight.DriftReport{
				BlockingDest:   []preflight.DriftItem{{Table: "users"}},
				BlockingSource: []preflight.DriftItem{{Table: "orders"}},
			},
			expected: false,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			got := len(tt.report.BlockingDest) == 0 && len(tt.report.BlockingSource) == 0
			if got != tt.expected {
				t.Errorf("expected IsReadyEligible=%v, got %v", tt.expected, got)
			}
		})
	}
}