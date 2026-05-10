package rules

import (
	"testing"
)

func TestValidateCast(t *testing.T) {
	tests := []struct {
		name    string
		rule    Rule
		wantErr bool
	}{
		{"valid cast string", Rule{Type: RuleTypeCast, Cast: &CastRule{TargetType: CastToString}}, false},
		{"valid cast int", Rule{Type: RuleTypeCast, Cast: &CastRule{TargetType: CastToInt}}, false},
		{"valid cast float", Rule{Type: RuleTypeCast, Cast: &CastRule{TargetType: CastToFloat}}, false},
		{"valid cast bool", Rule{Type: RuleTypeCast, Cast: &CastRule{TargetType: CastToBool}}, false},
		{"invalid cast type", Rule{Type: RuleTypeCast, Cast: &CastRule{TargetType: "invalid"}}, true},
		{"empty cast", Rule{Type: RuleTypeCast, Cast: nil}, true},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			err := Validate(tt.rule)
			if (err != nil) != tt.wantErr {
				t.Errorf("Validate() error = %v, wantErr %v", err, tt.wantErr)
			}
		})
	}
}

func TestValidateEnumMap(t *testing.T) {
	tests := []struct {
		name    string
		rule    Rule
		wantErr bool
	}{
		{"valid enum", Rule{Type: RuleTypeEnumMap, EnumMap: &EnumMapRule{Mapping: map[string]string{"a": "b"}, Fallback: FallbackNull, CaseSensitive: true}}, false},
		{"empty mapping", Rule{Type: RuleTypeEnumMap, EnumMap: &EnumMapRule{Mapping: map[string]string{}, Fallback: FallbackNull}}, true},
		{"nil mapping", Rule{Type: RuleTypeEnumMap, EnumMap: nil}, true},
		{"invalid fallback", Rule{Type: RuleTypeEnumMap, EnumMap: &EnumMapRule{Mapping: map[string]string{"a": "b"}, Fallback: "invalid"}}, true},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			err := Validate(tt.rule)
			if (err != nil) != tt.wantErr {
				t.Errorf("Validate() error = %v, wantErr %v", err, tt.wantErr)
			}
		})
	}
}

func TestValidateRegex(t *testing.T) {
	tests := []struct {
		name    string
		rule    Rule
		wantErr bool
	}{
		{"valid regex", Rule{Type: RuleTypeRegexReplace, Regex: &RegexRule{Pattern: "a+", Replacement: "b"}}, false},
		{"empty pattern", Rule{Type: RuleTypeRegexReplace, Regex: &RegexRule{Pattern: "", Replacement: "b"}}, true},
		{"invalid pattern", Rule{Type: RuleTypeRegexReplace, Regex: &RegexRule{Pattern: "[", Replacement: "b"}}, true},
		{"nil regex", Rule{Type: RuleTypeRegexReplace, Regex: nil}, true},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			err := Validate(tt.rule)
			if (err != nil) != tt.wantErr {
				t.Errorf("Validate() error = %v, wantErr %v", err, tt.wantErr)
			}
		})
	}
}

func TestValidateStringOp(t *testing.T) {
	tests := []struct {
		name    string
		rule    Rule
		wantErr bool
	}{
		{"valid trim", Rule{Type: RuleTypeStringOp, String: &StringRule{Operation: StringOpTrim}}, false},
		{"valid upper", Rule{Type: RuleTypeStringOp, String: &StringRule{Operation: StringOpUpper}}, false},
		{"valid lower", Rule{Type: RuleTypeStringOp, String: &StringRule{Operation: StringOpLower}}, false},
		{"valid substring", Rule{Type: RuleTypeStringOp, String: &StringRule{Operation: StringOpSubstring, Start: ptr(0)}}, false},
		{"invalid op", Rule{Type: RuleTypeStringOp, String: &StringRule{Operation: "invalid"}}, true},
		{"nil string", Rule{Type: RuleTypeStringOp, String: nil}, true},
		{"substring no start", Rule{Type: RuleTypeStringOp, String: &StringRule{Operation: StringOpSubstring}}, true},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			err := Validate(tt.rule)
			if (err != nil) != tt.wantErr {
				t.Errorf("Validate() error = %v, wantErr %v", err, tt.wantErr)
			}
		})
	}
}

func TestValidateDateFormat(t *testing.T) {
	tests := []struct {
		name    string
		rule    Rule
		wantErr bool
	}{
		{"valid date", Rule{Type: RuleTypeDateFormat, Date: &DateRule{InputLayout: "2006-01-02", OutputLayout: "2006-01-02", OnError: DateErrorNull}}, false},
		{"empty layout", Rule{Type: RuleTypeDateFormat, Date: &DateRule{InputLayout: "", OutputLayout: "2006-01-02", OnError: DateErrorNull}}, true},
		{"invalid layout", Rule{Type: RuleTypeDateFormat, Date: &DateRule{InputLayout: "invalid", OutputLayout: "2006-01-02", OnError: DateErrorNull}}, true},
		{"nil date", Rule{Type: RuleTypeDateFormat, Date: nil}, true},
		{"invalid error mode", Rule{Type: RuleTypeDateFormat, Date: &DateRule{InputLayout: "2006-01-02", OutputLayout: "2006-01-02", OnError: "invalid"}}, true},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			err := Validate(tt.rule)
			if (err != nil) != tt.wantErr {
				t.Errorf("Validate() error = %v, wantErr %v", err, tt.wantErr)
			}
		})
	}
}

func TestTranslateCast(t *testing.T) {
	fn := TranslateToFunc(Rule{Type: RuleTypeCast, Cast: &CastRule{TargetType: CastToInt}})

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
		rule     Rule
		input    any
		expected string
	}{
		{"trim", Rule{Type: RuleTypeStringOp, String: &StringRule{Operation: StringOpTrim}}, "  hello  ", "hello"},
		{"upper", Rule{Type: RuleTypeStringOp, String: &StringRule{Operation: StringOpUpper}}, "hello", "HELLO"},
		{"lower", Rule{Type: RuleTypeStringOp, String: &StringRule{Operation: StringOpLower}}, "HELLO", "hello"},
		{"substring", Rule{Type: RuleTypeStringOp, String: &StringRule{Operation: StringOpSubstring, Start: ptr(0), Length: ptr(3)}}, "hello", "hel"},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			fn := TranslateToFunc(tt.rule)
			result, _ := fn(tt.input)
			if result != tt.expected {
				t.Errorf("expected %v, got %v", tt.expected, result)
			}
		})
	}
}

func TestTranslateRegex(t *testing.T) {
	fn := TranslateToFunc(Rule{Type: RuleTypeRegexReplace, Regex: &RegexRule{Pattern: `(\d+)`, Replacement: "#"}})
	result, _ := fn("abc123def")
	if result != "abc#def" {
		t.Errorf("expected abc#def, got %v", result)
	}
}

func TestTranslateEnumMap(t *testing.T) {
	fn := TranslateToFunc(Rule{Type: RuleTypeEnumMap, EnumMap: &EnumMapRule{Mapping: map[string]string{"a": "x", "b": "y"}, Fallback: FallbackNull, CaseSensitive: true}})

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
	fn := TranslateToFunc(Rule{Type: RuleTypeDateFormat, Date: &DateRule{InputLayout: "2006-01-02", OutputLayout: "02/01/2006", OnError: DateErrorNull}})
	result, _ := fn("2024-05-10")
	if result != "10/05/2024" {
		t.Errorf("expected 10/05/2024, got %v", result)
	}
}

func ptr[T any](v T) *T {
	return &v
}
