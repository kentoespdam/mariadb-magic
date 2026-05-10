package rules

import (
	"errors"
	"regexp"
	"time"
)

var (
	ErrEmptyRule           = errors.New("rule is empty")
	ErrInvalidRuleType     = errors.New("invalid rule type")
	ErrEmptyCastType       = errors.New("cast target_type is required")
	ErrInvalidCastType     = errors.New("invalid cast target_type, must be: string, int, float, bool")
	ErrEmptyEnumMap        = errors.New("enum_map mapping cannot be empty")
	ErrInvalidEnumFallback = errors.New("invalid enum_map fallback, must be: null, original, fail")
	ErrEmptyRegexPattern   = errors.New("regex pattern cannot be empty")
	ErrInvalidRegex        = errors.New("regex pattern does not compile")
	ErrEmptyStringOp       = errors.New("string_op operation is required")
	ErrInvalidStringOp     = errors.New("invalid string_op operation, must be: trim, upper, lower, substring")
	ErrInvalidSubstring    = errors.New("substring requires start, and optional length")
	ErrEmptyDateLayout     = errors.New("date input_layout and output_layout are required")
	ErrInvalidDateLayout   = errors.New("date layout is not parseable")
	ErrInvalidDateError    = errors.New("invalid on_parse_error, must be: null, keep_original_string, fail_row")
)

func Validate(rule Rule) error {
	if rule.Type == "" {
		return ErrEmptyRule
	}
	switch rule.Type {
	case RuleTypeCast:
		return validateCast(rule.Cast)
	case RuleTypeEnumMap:
		return validateEnumMap(rule.EnumMap)
	case RuleTypeRegexReplace:
		return validateRegex(rule.Regex)
	case RuleTypeStringOp:
		return validateString(rule.String)
	case RuleTypeDateFormat:
		return validateDate(rule.Date)
	default:
		return ErrInvalidRuleType
	}
}

func validateCast(c *CastRule) error {
	if c == nil {
		return ErrEmptyCastType
	}
	if c.TargetType == "" {
		return ErrEmptyCastType
	}
	switch c.TargetType {
	case CastToString, CastToInt, CastToFloat, CastToBool:
		return nil
	default:
		return ErrInvalidCastType
	}
}

func validateEnumMap(e *EnumMapRule) error {
	if e == nil {
		return ErrEmptyEnumMap
	}
	if len(e.Mapping) == 0 {
		return ErrEmptyEnumMap
	}
	switch e.Fallback {
	case FallbackNull, FallbackOriginal, FallbackFail:
		return nil
	default:
		return ErrInvalidEnumFallback
	}
}

func validateRegex(r *RegexRule) error {
	if r == nil || r.Pattern == "" {
		return ErrEmptyRegexPattern
	}
	_, err := regexp.Compile(r.Pattern)
	if err != nil {
		return ErrInvalidRegex
	}
	return nil
}

func validateString(s *StringRule) error {
	if s == nil {
		return ErrEmptyStringOp
	}
	if s.Operation == "" {
		return ErrEmptyStringOp
	}
	switch s.Operation {
	case StringOpTrim, StringOpUpper, StringOpLower:
		return nil
	case StringOpSubstring:
		if s.Start == nil || *s.Start < 0 {
			return ErrInvalidSubstring
		}
		return nil
	default:
		return ErrInvalidStringOp
	}
}

func validateDate(d *DateRule) error {
	if d == nil {
		return ErrEmptyDateLayout
	}
	if d.InputLayout == "" || d.OutputLayout == "" {
		return ErrEmptyDateLayout
	}
	testDate := "2006-01-02"
	if _, err := time.Parse(d.InputLayout, testDate); err != nil {
		return ErrInvalidDateLayout
	}
	if _, err := time.Parse(d.OutputLayout, testDate); err != nil {
		return ErrInvalidDateLayout
	}
	switch d.OnError {
	case DateErrorNull, DateErrorKeepOriginal, DateErrorFailRow:
		return nil
	default:
		return ErrInvalidDateError
	}
}

func ValidatePreview(rule Rule, values []any) []PreviewResult {
	fn := TranslateToFunc(rule)
	results := make([]PreviewResult, len(values))
	for i, v := range results {
		dest, err := fn(v)
		var friendly string
		if err != nil {
			friendly = ToFriendly(err)
		}
		results[i] = PreviewResult{
			SourceValue: v,
			DestValue:   dest,
			Status:      "ok",
			Error:       friendly,
		}
		if err != nil {
			results[i].Status = "error"
		}
	}
	return results
}

type PreviewResult struct {
	SourceValue any    `json:"source_value"`
	DestValue   any    `json:"dest_value"`
	Status      string `json:"status"`
	Error       string `json:"error,omitempty"`
}
