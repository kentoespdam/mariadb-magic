package rules

import (
	"strings"
)

func translateEnumMap(e *EnumMapRule) func(any) (any, error) {
	return func(v any) (any, error) {
		if v == nil {
			return nil, nil
		}
		s := fmtValue(v)
		mapping := e.Mapping
		if !e.CaseSensitive {
			s = strings.ToLower(s)
			newMap := make(map[string]string)
			for k, val := range mapping {
				newMap[strings.ToLower(k)] = val
			}
			mapping = newMap
		}
		if dest, ok := mapping[s]; ok {
			if dest == "__NULL__" {
				return nil, nil
			}
			return dest, nil
		}
		switch e.Fallback {
		case FallbackNull:
			return nil, nil
		case FallbackOriginal:
			return v, nil
		case FallbackFail:
			return nil, TranslateError{SourceValue: v, Message: "value not in enum map and fallback is fail"}
		}
		return v, nil
	}
}
