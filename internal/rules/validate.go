package rules

import "fmt"

// Validate checks a RuleSet for errors.
func Validate(rs RuleSet) error {
	for i, rule := range rs.Rules {
		prefix := fmt.Sprintf("rule[%d]:", i)
		if err := validateCondition(prefix, rule.If); err != nil {
			return err
		}
		if err := validateAction(prefix, rule.Then); err != nil {
			return err
		}
		if rule.Else != nil {
			if err := validateAction(prefix+" else:", *rule.Else); err != nil {
				return err
			}
		}
	}
	return nil
}

func validateCondition(prefix string, c Condition) error {
	if c.Column == "" {
		return fmt.Errorf("%s condition missing column", prefix)
	}
	switch c.Operator {
	case OpEquals, OpIn, OpRange, OpRegex:
		// ok
	default:
		return fmt.Errorf("%s unknown operator %q", prefix, c.Operator)
	}
	if c.Value == nil {
		return fmt.Errorf("%s condition missing value", prefix)
	}
	return nil
}

func validateAction(prefix string, a Action) error {
	switch a.Type {
	case ActionSetValue:
		if a.Column == "" {
			return fmt.Errorf("%s setValue missing column", prefix)
		}
	case ActionCast:
		if a.Column == "" {
			return fmt.Errorf("%s cast missing column", prefix)
		}
		if a.CastTo == "" {
			return fmt.Errorf("%s cast missing castTo", prefix)
		}
	case ActionNull:
		if a.Column == "" {
			return fmt.Errorf("%s null missing column", prefix)
		}
	default:
		return fmt.Errorf("%s unknown action type %q", prefix, a.Type)
	}
	return nil
}
