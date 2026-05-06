package rules

import "reflect"

// TransformFunc transforms a row in-place and returns it.
type TransformFunc func(row map[string]any) map[string]any

// Translate converts a RuleSet into a TransformFunc.
func Translate(rs RuleSet) TransformFunc {
	return func(row map[string]any) map[string]any {
		for _, rule := range rs.Rules {
			if evaluate(rule.If, row) {
				apply(row, rule.Then)
			} else if rule.Else != nil {
				apply(row, *rule.Else)
			}
		}
		return row
	}
}

func evaluate(cond Condition, row map[string]any) bool {
	val, ok := row[cond.Column]
	if !ok {
		return false
	}
	switch cond.Operator {
	case OpEquals:
		return reflect.DeepEqual(val, cond.Value)
	case OpIn:
		return inSlice(val, cond.Value)
	case OpRange:
		return inRange(val, cond.Value)
	case OpRegex:
		return matchRegex(val, cond.Value)
	}
	return false
}

func apply(row map[string]any, action Action) {
	switch action.Type {
	case ActionSetValue:
		if action.Column != "" {
			row[action.Column] = action.Value
		}
	case ActionCast:
		if action.Column != "" {
			row[action.Column] = castValue(row[action.Column], action.CastTo)
		}
	case ActionNull:
		if action.Column != "" {
			row[action.Column] = nil
		}
	}
}
