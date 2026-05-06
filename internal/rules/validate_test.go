package rules

import "testing"

func TestValidate(t *testing.T) {
	tests := []struct {
		name    string
		rs      RuleSet
		wantErr bool
	}{
		{"valid", RuleSet{Rules: []Rule{
			{If: Condition{Column: "x", Operator: OpEquals, Value: 1},
				Then: Action{Type: ActionSetValue, Column: "y", Value: 2}}}}, false},
		{"missing column", RuleSet{Rules: []Rule{
			{If: Condition{Operator: OpEquals, Value: 1},
				Then: Action{Type: ActionSetValue, Column: "y", Value: 2}}}}, true},
		{"bad operator", RuleSet{Rules: []Rule{
			{If: Condition{Column: "x", Operator: "bad", Value: 1},
				Then: Action{Type: ActionSetValue, Column: "y", Value: 2}}}}, true},
		{"bad action", RuleSet{Rules: []Rule{
			{If: Condition{Column: "x", Operator: OpEquals, Value: 1},
				Then: Action{Type: "bad"}}}}, true},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			err := Validate(tt.rs)
			if (err != nil) != tt.wantErr {
				t.Errorf("Validate() error = %v, wantErr %v", err, tt.wantErr)
			}
		})
	}
}
