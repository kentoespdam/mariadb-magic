package rules

import "testing"

func BenchmarkTranslate(b *testing.B) {
	rs := RuleSet{Rules: []Rule{
		{If: Condition{Column: "status", Operator: OpEquals, Value: "active"},
			Then: Action{Type: ActionSetValue, Column: "is_active", Value: true}},
		{If: Condition{Column: "age", Operator: OpRange, Value: []any{18, 65}},
			Then: Action{Type: ActionSetValue, Column: "eligible", Value: true}},
	}}
	fn := Translate(rs)
	row := map[string]any{"status": "active", "age": 30, "is_active": false, "eligible": false}
	b.ResetTimer()
	for i := 0; i < b.N; i++ {
		fn(makeCopy(row))
	}
}

func makeCopy(m map[string]any) map[string]any {
	c := make(map[string]any, len(m))
	for k, v := range m {
		c[k] = v
	}
	return c
}
