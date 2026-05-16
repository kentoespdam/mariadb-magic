package rules_test

import (
	"testing"

	"magic-mariadb/internal/rules"
)

func ptr[T any](v T) *T {
	return &v
}

func TestValidateCast(t *testing.T) {
	tests := []struct {
		name    string
		rule    rules.Rule
		wantErr bool
	}{
		{"valid cast string", rules.Rule{Type: rules.RuleTypeCast, Cast: &rules.CastRule{TargetType: rules.CastToString}}, false},
		{"valid cast int", rules.Rule{Type: rules.RuleTypeCast, Cast: &rules.CastRule{TargetType: rules.CastToInt}}, false},
		{"valid cast float", rules.Rule{Type: rules.RuleTypeCast, Cast: &rules.CastRule{TargetType: rules.CastToFloat}}, false},
		{"valid cast bool", rules.Rule{Type: rules.RuleTypeCast, Cast: &rules.CastRule{TargetType: rules.CastToBool}}, false},
		{"invalid cast type", rules.Rule{Type: rules.RuleTypeCast, Cast: &rules.CastRule{TargetType: "invalid"}}, true},
		{"empty cast", rules.Rule{Type: rules.RuleTypeCast, Cast: nil}, true},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			err := rules.Validate(tt.rule)
			if (err != nil) != tt.wantErr {
				t.Errorf("Validate() error = %v, wantErr %v", err, tt.wantErr)
			}
		})
	}
}

func TestValidateEnumMap(t *testing.T) {
	tests := []struct {
		name    string
		rule    rules.Rule
		wantErr bool
	}{
		{"valid enum", rules.Rule{Type: rules.RuleTypeEnumMap, EnumMap: &rules.EnumMapRule{Mapping: map[string]string{"a": "b"}, Fallback: rules.FallbackNull, CaseSensitive: true}}, false},
		{"empty mapping", rules.Rule{Type: rules.RuleTypeEnumMap, EnumMap: &rules.EnumMapRule{Mapping: map[string]string{}, Fallback: rules.FallbackNull}}, true},
		{"nil mapping", rules.Rule{Type: rules.RuleTypeEnumMap, EnumMap: nil}, true},
		{"invalid fallback", rules.Rule{Type: rules.RuleTypeEnumMap, EnumMap: &rules.EnumMapRule{Mapping: map[string]string{"a": "b"}, Fallback: "invalid"}}, true},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			err := rules.Validate(tt.rule)
			if (err != nil) != tt.wantErr {
				t.Errorf("Validate() error = %v, wantErr %v", err, tt.wantErr)
			}
		})
	}
}

func TestValidateRegex(t *testing.T) {
	tests := []struct {
		name    string
		rule    rules.Rule
		wantErr bool
	}{
		{"valid regex", rules.Rule{Type: rules.RuleTypeRegexReplace, Regex: &rules.RegexRule{Pattern: "a+", Replacement: "b"}}, false},
		{"empty pattern", rules.Rule{Type: rules.RuleTypeRegexReplace, Regex: &rules.RegexRule{Pattern: "", Replacement: "b"}}, true},
		{"invalid pattern", rules.Rule{Type: rules.RuleTypeRegexReplace, Regex: &rules.RegexRule{Pattern: "[", Replacement: "b"}}, true},
		{"nil regex", rules.Rule{Type: rules.RuleTypeRegexReplace, Regex: nil}, true},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			err := rules.Validate(tt.rule)
			if (err != nil) != tt.wantErr {
				t.Errorf("Validate() error = %v, wantErr %v", err, tt.wantErr)
			}
		})
	}
}

func TestValidateStringOp(t *testing.T) {
	tests := []struct {
		name    string
		rule    rules.Rule
		wantErr bool
	}{
		{"valid trim", rules.Rule{Type: rules.RuleTypeStringOp, String: &rules.StringRule{Operation: rules.StringOpTrim}}, false},
		{"valid upper", rules.Rule{Type: rules.RuleTypeStringOp, String: &rules.StringRule{Operation: rules.StringOpUpper}}, false},
		{"valid lower", rules.Rule{Type: rules.RuleTypeStringOp, String: &rules.StringRule{Operation: rules.StringOpLower}}, false},
		{"valid substring", rules.Rule{Type: rules.RuleTypeStringOp, String: &rules.StringRule{Operation: rules.StringOpSubstring, Start: ptr(0)}}, false},
		{"invalid op", rules.Rule{Type: rules.RuleTypeStringOp, String: &rules.StringRule{Operation: "invalid"}}, true},
		{"nil string", rules.Rule{Type: rules.RuleTypeStringOp, String: nil}, true},
		{"substring no start", rules.Rule{Type: rules.RuleTypeStringOp, String: &rules.StringRule{Operation: rules.StringOpSubstring}}, true},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			err := rules.Validate(tt.rule)
			if (err != nil) != tt.wantErr {
				t.Errorf("Validate() error = %v, wantErr %v", err, tt.wantErr)
			}
		})
	}
}

func TestValidateDateFormat(t *testing.T) {
	tests := []struct {
		name    string
		rule    rules.Rule
		wantErr bool
	}{
		{"valid date", rules.Rule{Type: rules.RuleTypeDateFormat, Date: &rules.DateRule{InputLayout: "2006-01-02", OutputLayout: "2006-01-02", OnError: rules.DateErrorNull}}, false},
		{"empty layout", rules.Rule{Type: rules.RuleTypeDateFormat, Date: &rules.DateRule{InputLayout: "", OutputLayout: "2006-01-02", OnError: rules.DateErrorNull}}, true},
		{"invalid layout", rules.Rule{Type: rules.RuleTypeDateFormat, Date: &rules.DateRule{InputLayout: "invalid", OutputLayout: "2006-01-02", OnError: rules.DateErrorNull}}, true},
		{"nil date", rules.Rule{Type: rules.RuleTypeDateFormat, Date: nil}, true},
		{"invalid error mode", rules.Rule{Type: rules.RuleTypeDateFormat, Date: &rules.DateRule{InputLayout: "2006-01-02", OutputLayout: "2006-01-02", OnError: "invalid"}}, true},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			err := rules.Validate(tt.rule)
			if (err != nil) != tt.wantErr {
				t.Errorf("Validate() error = %v, wantErr %v", err, tt.wantErr)
			}
		})
	}
}

func TestTranslateCast(t *testing.T) {
	fn := rules.TranslateToFunc(rules.Rule{Type: rules.RuleTypeCast, Cast: &rules.CastRule{TargetType: rules.CastToInt}})

	result, err := fn("123")
	if err != nil || result != 123 {
		t.Errorf("expected 123, got %v, err: %v", result, err)
	}

	result, err = fn("abc")
	if err == nil {
		t.Errorf("expected error for invalid int")
	}
}

func TestTranslateStringOp(t *testing.T) {
	tests := []struct {
		name     string
		rule     rules.Rule
		input    any
		expected string
	}{
		{"trim", rules.Rule{Type: rules.RuleTypeStringOp, String: &rules.StringRule{Operation: rules.StringOpTrim}}, "  hello  ", "hello"},
		{"upper", rules.Rule{Type: rules.RuleTypeStringOp, String: &rules.StringRule{Operation: rules.StringOpUpper}}, "hello", "HELLO"},
		{"lower", rules.Rule{Type: rules.RuleTypeStringOp, String: &rules.StringRule{Operation: rules.StringOpLower}}, "HELLO", "hello"},
		{"substring", rules.Rule{Type: rules.RuleTypeStringOp, String: &rules.StringRule{Operation: rules.StringOpSubstring, Start: ptr(0), Length: ptr(3)}}, "hello", "hel"},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			fn := rules.TranslateToFunc(tt.rule)
			result, _ := fn(tt.input)
			if result != tt.expected {
				t.Errorf("expected %v, got %v", tt.expected, result)
			}
		})
	}
}

func TestTranslateRegex(t *testing.T) {
	fn := rules.TranslateToFunc(rules.Rule{Type: rules.RuleTypeRegexReplace, Regex: &rules.RegexRule{Pattern: `(\d+)`, Replacement: "#"}})
	result, _ := fn("abc123def")
	if result != "abc#def" {
		t.Errorf("expected abc#def, got %v", result)
	}
}

func TestTranslateEnumMap(t *testing.T) {
	fn := rules.TranslateToFunc(rules.Rule{Type: rules.RuleTypeEnumMap, EnumMap: &rules.EnumMapRule{Mapping: map[string]string{"a": "x", "b": "y"}, Fallback: rules.FallbackNull, CaseSensitive: true}})

	result, _ := fn("a")
	if result != "x" {
		t.Errorf("expected x, got %v", result)
	}

	result, _ = fn("unknown")
	if result != nil {
		t.Errorf("expected nil for unknown, got %v", result)
	}
}

func TestTranslateDate(t *testing.T) {
	fn := rules.TranslateToFunc(rules.Rule{Type: rules.RuleTypeDateFormat, Date: &rules.DateRule{InputLayout: "2006-01-02", OutputLayout: "02/01/2006", OnError: rules.DateErrorNull}})
	result, _ := fn("2024-05-10")
	if result != "10/05/2024" {
		t.Errorf("expected 10/05/2024, got %v", result)
	}
}
