package rules

type RuleType string

const (
	RuleTypeCast         RuleType = "cast"
	RuleTypeEnumMap      RuleType = "enum_map"
	RuleTypeRegexReplace RuleType = "regex_replace"
	RuleTypeStringOp     RuleType = "string_op"
	RuleTypeDateFormat   RuleType = "date_format"
)

type CastTargetType string

const (
	CastToString CastTargetType = "string"
	CastToInt    CastTargetType = "int"
	CastToFloat  CastTargetType = "float"
	CastToBool   CastTargetType = "bool"
)

type FallbackStrategy string

const (
	FallbackNull     FallbackStrategy = "null"
	FallbackOriginal FallbackStrategy = "original"
	FallbackFail     FallbackStrategy = "fail"
)

type StringOpType string

const (
	StringOpTrim      StringOpType = "trim"
	StringOpUpper     StringOpType = "upper"
	StringOpLower     StringOpType = "lower"
	StringOpSubstring StringOpType = "substring"
)

type DateParseErrorMode string

const (
	DateErrorNull         DateParseErrorMode = "null"
	DateErrorKeepOriginal DateParseErrorMode = "keep_original_string"
	DateErrorFailRow      DateParseErrorMode = "fail_row"
)

type Rule struct {
	Type    RuleType     `json:"type"`
	Cast    *CastRule    `json:"cast,omitempty"`
	EnumMap *EnumMapRule `json:"enum_map,omitempty"`
	Regex   *RegexRule   `json:"regex,omitempty"`
	String  *StringRule  `json:"string_op,omitempty"`
	Date    *DateRule    `json:"date_format,omitempty"`
}

type CastRule struct {
	TargetType CastTargetType `json:"target_type"`
}

type EnumMapRule struct {
	Mapping       map[string]string `json:"mapping"`
	Fallback      FallbackStrategy  `json:"fallback"`
	CaseSensitive bool              `json:"case_sensitive"`
}

type RegexRule struct {
	Pattern     string `json:"pattern"`
	Replacement string `json:"replacement"`
}

type StringRule struct {
	Operation StringOpType `json:"operation"`
	Start     *int         `json:"start,omitempty"`
	Length    *int         `json:"length,omitempty"`
}

type DateRule struct {
	InputLayout  string             `json:"input_layout"`
	OutputLayout string             `json:"output_layout"`
	OnError      DateParseErrorMode `json:"on_parse_error"`
}

type RuleStore map[string]map[string]Rule

func NewRuleStore() RuleStore {
	return make(RuleStore)
}
