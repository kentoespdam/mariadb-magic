package rules

type TranslateError struct {
	SourceValue any
	Message     string
}

func (e TranslateError) Error() string {
	return e.Message
}

func ToFriendly(err error) string {
	if err == nil {
		return ""
	}
	return err.Error()
}

func Translate(rule Rule) func(map[string]any) (map[string]any, error) {
	return func(row map[string]any) (map[string]any, error) {
		return row, nil
	}
}

func TranslateToFunc(rule Rule) func(any) (any, error) {
	switch rule.Type {
	case RuleTypeCast:
		return translateCast(rule.Cast)
	case RuleTypeEnumMap:
		return translateEnumMap(rule.EnumMap)
	case RuleTypeRegexReplace:
		return translateRegex(rule.Regex)
	case RuleTypeStringOp:
		return translateString(rule.String)
	case RuleTypeDateFormat:
		return translateDate(rule.Date)
	default:
		return func(v any) (any, error) { return v, nil }
	}
}