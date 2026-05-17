export type ProfileStatus = "draft" | "ready";

export type SourceValueType =
  | "column"
  | "constant"
  | "null"
  | "default_db"
  | "skip";

export interface ColumnPairing {
  dest_column: string;
  is_pk: boolean;
  source_type: SourceValueType;
  source_column?: string;
  constant_val?: string;
  status: string; // "auto", "resolved", "unresolved"
}

export interface TableMapping {
  table_name: string;
  column_pairs: ColumnPairing[];
  unresolved_cnt: number;
  total_cols: number;
}

export interface ProfileMappings {
  tables: TableMapping[];
}

export type RuleType =
  | "cast"
  | "enum_map"
  | "regex_replace"
  | "string_op"
  | "date_format";

export interface Rule {
  type: RuleType;
  cast?: {
    target_type: "string" | "int" | "float" | "bool";
  };
  enum_map?: {
    mapping: Record<string, string>;
    fallback: "null" | "original" | "fail";
    case_sensitive?: boolean;
  };
  regex_replace?: {
    pattern: string;
    replacement: string;
  };
  string_op?: {
    operation: "trim" | "upper" | "lower" | "substring";
    start?: number;
    length?: number;
  };
  date_format?: {
    input_layout: string;
    output_layout: string;
    on_parse_error: "null" | "keep_original_string" | "fail_row";
  };
}

export interface RulesMap {
  [key: string]: Rule;
}

export interface ValidationError {
  Table: string;
  Column: string;
  Message: string;
}

export interface Conflict {
  Table: string;
  ProfileID: string;
  ProfileName: string;
}

export interface MarkReadyResponse {
  valid: boolean;
  errors?: ValidationError[];
  error_friendly?: string;
  conflicts?: Conflict[];
}

export interface PreviewResult {
  source_value: unknown;
  dest_value: unknown;
  status: "ok" | "error";
  error?: string;
}

export interface MappingProfile {
  id: string;
  name: string;
  source_connection_id: string;
  destination_connection_id: string;
  selection_json: any;
  column_pairings_json: any;
  rules_json: any;
  status: ProfileStatus;
  created_at: string;
  updated_at: string;
}

// CreateProfileInput selaras dengan CreateProfileRequest di internal/api/profiles.go.
// BE mengharapkan array tables (kemudian di-marshal jadi selection_json di handler).
export interface CreateProfileInput {
  name: string;
  source_connection_id: string;
  destination_connection_id: string;
  tables: string[];
}

// Update pairings/rules dikirim sebagai JSON string (lihat UpdatePairingsRequest BE).
export interface UpdatePairingsInput {
  column_pairings_json: string;
  rules_json: string;
}

export interface DriftItem {
  table: string;
  column?: string;
  reason?: string;
  severity?: string;
  action?: string;
  note?: string;
  message?: string;
}

export interface DriftReport {
  blocking_dest: DriftItem[];
  blocking_source: DriftItem[];
  auto_handled_dest: DriftItem[];
  auto_handled_src: DriftItem[];
  is_ready_eligible: boolean;
}

export interface TableWithRole {
  name: string;
  role: "user_selected" | "advisor_added";
}

export interface ColumnInfo {
  Name: string;
  Nullable: boolean;
  Default: string | null;
  IsPK: boolean;
}

export interface TableSchema {
  [columnName: string]: ColumnInfo;
}

export interface SchemaResponse {
  source_schema: { [tableName: string]: TableSchema };
  dest_schema: { [tableName: string]: TableSchema };
  tables: TableWithRole[];
  available_tables: string[];
}
