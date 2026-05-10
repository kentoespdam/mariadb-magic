export type RuleType = "cast" | "enum_map" | "regex_replace" | "string_op" | "date_format";

export interface Rule {
  id: string;
  type: RuleType;
  config: RuleConfig;
  name?: string;
}

export interface RuleConfig {
  cast_type?: string;
  enum_map?: Record<string, string>;
  pattern?: string;
  replacement?: string;
  string_operation?: "uppercase" | "lowercase" | "trim" | "strip_tags";
  date_input_format?: string;
  date_output_format?: string;
}

export interface RuleSample {
  input: string;
  output: string;
  valid: boolean;
}
