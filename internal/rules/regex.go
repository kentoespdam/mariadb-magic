package rules

import (
	"regexp"
)

func translateRegex(r *RegexRule) func(any) (any, error) {
	re := regexp.MustCompile(r.Pattern)
	return func(v any) (any, error) {
		if v == nil {
			return nil, nil
		}
		s := fmtValue(v)
		return re.ReplaceAllString(s, r.Replacement), nil
	}
}
