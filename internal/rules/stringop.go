package rules

import (
	"strings"
)

func translateString(strRule *StringRule) func(any) (any, error) {
	return func(v any) (any, error) {
		if v == nil {
			return nil, nil
		}
		s := fmtValue(v)
		switch strRule.Operation {
		case StringOpTrim:
			return strings.TrimSpace(s), nil
		case StringOpUpper:
			return strings.ToUpper(s), nil
		case StringOpLower:
			return strings.ToLower(s), nil
		case StringOpSubstring:
			runes := []rune(s)
			start := 0
			if strRule.Start != nil && *strRule.Start < len(runes) {
				start = *strRule.Start
			}
			length := len(runes) - start
			if strRule.Length != nil && *strRule.Length < length {
				length = *strRule.Length
			}
			if start >= len(runes) {
				return "", nil
			}
			return string(runes[start : start+length]), nil
		}
		return v, nil
	}
}
