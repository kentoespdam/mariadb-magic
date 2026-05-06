package rules

// Operator defines the comparison operator for a condition.
type Operator string

const (
	OpEquals  Operator = "equals"
	OpIn      Operator = "in"
	OpRange   Operator = "range"
	OpRegex   Operator = "regex"
)

// ActionType defines what to do when a rule matches.
type ActionType string

const (
	ActionSetValue ActionType = "setValue"
	ActionCast     ActionType = "cast"
	ActionNull     ActionType = "null"
)

// Condition is the IF part of a rule.
type Condition struct {
	Column   string      `json:"column"`
	Operator Operator    `json:"operator"`
	Value    interface{} `json:"value"`
}

// Action is a THEN or ELSE part of a rule.
type Action struct {
	Type   ActionType `json:"type"`
	Column string     `json:"column,omitempty"`
	Value  interface{} `json:"value,omitempty"`
	CastTo string     `json:"castTo,omitempty"`
}

// Rule represents an If-Then-Else transformation rule.
type Rule struct {
	If   Condition `json:"if"`
	Then Action   `json:"then"`
	Else *Action  `json:"else,omitempty"`
}

// RuleSet is a collection of rules applied to a row.
type RuleSet struct {
	Rules []Rule `json:"rules"`
}
