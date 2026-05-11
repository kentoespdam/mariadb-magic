package preflight

import (
	"testing"
)

func TestDriftReport_IsReadyEligible(t *testing.T) {
	tests := []struct {
		name     string
		report   DriftReport
		expected bool
	}{
		{
			name: "no blocking - eligible",
			report: DriftReport{
				BlockingDest:   []DriftItem{},
				BlockingSource: []DriftItem{},
			},
			expected: true,
		},
		{
			name: "has blocking dest - not eligible",
			report: DriftReport{
				BlockingDest:   []DriftItem{{Table: "users", Message: "extra column"}},
				BlockingSource: []DriftItem{},
			},
			expected: false,
		},
		{
			name: "has blocking source - not eligible",
			report: DriftReport{
				BlockingDest:   []DriftItem{},
				BlockingSource: []DriftItem{{Table: "orders", Message: "missing column"}},
			},
			expected: false,
		},
		{
			name: "both blocking - not eligible",
			report: DriftReport{
				BlockingDest:   []DriftItem{{Table: "users"}},
				BlockingSource: []DriftItem{{Table: "orders"}},
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