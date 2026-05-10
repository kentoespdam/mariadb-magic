export interface MappingProfile {
  id: string;
  name: string;
  source_id: string;
  destination_id: string;
  selection_set: SelectionSet;
  column_pairings: ColumnPairing[];
  rules: Rule[];
  status: "draft" | "ready";
  created_at: string;
  updated_at: string;
}

export interface SelectionSet {
  tables: TableSelection[];
}

export interface TableSelection {
  table_name: string;
  selected: boolean;
  where_clause?: string;
}

export interface ColumnPairing {
  id: string;
  source_table: string;
  source_column: string;
  destination_table: string;
  destination_column: string;
  match_key: boolean;
  source_type: ColumnSourceType;
  default_value?: string;
  rule_id?: string;
}

export type ColumnSourceType = "source_column" | "constant" | "null" | "default_db" | "skip";

export interface Rule {
  id: string;
  type: RuleType;
  config: RuleConfig;
}

export type RuleType = "cast" | "enum_map" | "regex_replace" | "string_op" | "date_format";

export interface RuleConfig {
  cast_type?: string;
  enum_map?: Record<string, string>;
  pattern?: string;
  replacement?: string;
  string_operation?: "uppercase" | "lowercase" | "trim" | "strip_tags";
  date_input_format?: string;
  date_output_format?: string;
}

export interface ClosurePreview {
  execution_order: string[];
  fk_dependencies: Record<string, string[]>;
  tables_with_foreign_keys: string[];
}
