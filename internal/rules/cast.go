package rules

import (
	"strconv"
	"strings"
)

func translateCast(c *CastRule) func(any) (any, error) {
	return func(v any) (any, error) {
		if v == nil {
			return nil, nil
		}
		s := fmtValue(v)
		switch c.TargetType {
		case CastToString:
			return s, nil
		case CastToInt:
			i, err := strconv.Atoi(s)
			if err != nil {
				return nil, TranslateError{SourceValue: v, Message: "cannot convert to integer"}
			}
			return i, nil
		case CastToFloat:
			f, err := strconv.ParseFloat(s, 64)
			if err != nil {
				return nil, TranslateError{SourceValue: v, Message: "cannot convert to float"}
			}
			return f, nil
		case CastToBool:
			lower := strings.ToLower(s)
			if lower == "true" || lower == "1" || lower == "yes" {
				return true, nil
			}
			if lower == "false" || lower == "0" || lower == "no" || lower == "" {
				return false, nil
			}
			return nil, TranslateError{SourceValue: v, Message: "cannot convert to boolean"}
		}
		return v, nil
	}
}
