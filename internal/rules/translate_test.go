package rules

import "testing"

func TestTranslateEquals(t *testing.T) {
	rs := RuleSet{Rules: []Rule{
		{If: Condition{Column: "status", Operator: OpEquals, Value: "active"},
			Then: Action{Type: ActionSetValue, Column: "is_active", Value: true}},
	}}
	fn := Translate(rs)
	row := map[string]any{"status": "active", "is_active": false}
	if fn(row)["is_active"] != true {
		t.Error("expected is_active=true")
	}
}

func TestTranslateIn(t *testing.T) {
	rs := RuleSet{Rules: []Rule{
		{If: Condition{Column: "code", Operator: OpIn, Value: []any{1, 2, 3}},
			Then: Action{Type: ActionSetValue, Column: "found", Value: true}},
	}}
	fn := Translate(rs)
	if !fn(map[string]any{"code": 2, "found": false})["found"].(bool) {
		t.Error("expected found=true")
	}
}

func TestTranslateRange(t *testing.T) {
	rs := RuleSet{Rules: []Rule{
		{If: Condition{Column: "age", Operator: OpRange, Value: []any{18, 65}},
			Then: Action{Type: ActionSetValue, Column: "eligible", Value: true}},
	}}
	fn := Translate(rs)
	if !fn(map[string]any{"age": 30, "eligible": false})["eligible"].(bool) {
		t.Error("expected eligible=true")
	}
}

func TestTranslateRegex(t *testing.T) {
	rs := RuleSet{Rules: []Rule{
		{If: Condition{Column: "email", Operator: OpRegex, Value: `.*@example\.com$`},
			Then: Action{Type: ActionSetValue, Column: "valid", Value: true}},
	}}
	fn := Translate(rs)
	if !fn(map[string]any{"email": "test@example.com", "valid": false})["valid"].(bool) {
		t.Error("expected valid=true")
	}
}

func TestTranslateCast(t *testing.T) {
	rs := RuleSet{Rules: []Rule{
		{If: Condition{Column: "val", Operator: OpEquals, Value: "1"},
			Then: Action{Type: ActionCast, Column: "val", CastTo: "bool"}},
	}}
	fn := Translate(rs)
	if fn(map[string]any{"val": "1"})["val"] != true {
		t.Error("expected val=true after cast")
	}
}

func TestTranslateNull(t *testing.T) {
	rs := RuleSet{Rules: []Rule{
		{If: Condition{Column: "x", Operator: OpEquals, Value: "skip"},
			Then: Action{Type: ActionNull, Column: "x"}},
	}}
	fn := Translate(rs)
	if fn(map[string]any{"x": "skip"})["x"] != nil {
		t.Error("expected x=nil")
	}
}

func TestTranslateElse(t *testing.T) {
	elseAction := Action{Type: ActionSetValue, Column: "result", Value: "other"}
	rs := RuleSet{Rules: []Rule{
		{If: Condition{Column: "type", Operator: OpEquals, Value: "A"},
			Then: Action{Type: ActionSetValue, Column: "result", Value: "alpha"},
			Else: &elseAction},
	}}
	fn := Translate(rs)
	if fn(map[string]any{"type": "B", "result": ""})["result"] != "other" {
		t.Error("expected result=other from else")
	}
}
