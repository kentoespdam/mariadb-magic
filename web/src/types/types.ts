export type SourceType = 'column' | 'constant' | 'null' | 'default_db' | 'skip' | 'unresolved'

export interface ColumnPair {
  dest_column: string
  is_pk: boolean
  source_type: SourceType
  source_column?: string
  constant_val?: string
  status: 'auto' | 'unresolved' | 'resolved'
}

export interface TableMapping {
  table_name: string
  column_pairs: ColumnPair[]
  unresolved_cnt: number
  total_cols: number
}

export interface ProfileMappings {
  tables: TableMapping[]
}

export interface ColumnInfo {
  name: string
  nullable: boolean
  default: string | null
  is_pk: boolean
}

export interface TableSchema {
  [key: string]: ColumnInfo
}

export interface TableWithRole {
  name: string
  role: string
}

export interface SchemaData {
  source_schema: TableSchema
  dest_schema: TableSchema
  tables: TableWithRole[]
}

export interface Profile {
  id: string
  name: string
  status: string
  source_connection_id: string
  destination_connection_id: string
  selection_json: string
  column_pairings_json: string
  rules_json: string
}

export interface ValidationError {
  Table: string
  Column: string
  Message: string
}

export interface Conflict {
  table: string
  profile_id: string
  profile_name: string
}

export interface MarkReadyResponse {
  valid: boolean
  errors?: ValidationError[]
  error_friendly?: string
  conflicts?: Conflict[]
}

export type RuleType = 'cast' | 'enum_map' | 'regex_replace' | 'string_op' | 'date_format'

export type CastTargetType = 'string' | 'int' | 'float' | 'bool'

export type FallbackStrategy = 'null' | 'original' | 'fail'

export type StringOpType = 'trim' | 'upper' | 'lower' | 'substring'

export type DateParseErrorMode = 'null' | 'keep_original_string' | 'fail_row'

export interface CastRule {
  target_type: CastTargetType
}

export interface EnumMapRule {
  mapping: Record<string, string>
  fallback: FallbackStrategy
  case_sensitive: boolean
}

export interface RegexRule {
  pattern: string
  replacement: string
}

export interface StringRule {
  operation: StringOpType
  start?: number
  length?: number
}

export interface DateRule {
  input_layout: string
  output_layout: string
  on_parse_error: DateParseErrorMode
}

export interface Rule {
  type: RuleType
  cast?: CastRule
  enum_map?: EnumMapRule
  regex?: RegexRule
  string_op?: StringRule
  date_format?: DateRule
}

export interface PreviewResult {
  source_value: any
  dest_value: any
  status: 'ok' | 'error'
  error?: string
}

export interface SyncSession {
  id: string
  profile_id: string
  profile_snapshot_json: string
  status: 'pending' | 'running' | 'done' | 'cancelled' | 'failed' | 'interrupted'
  started_at: string
  ended_at: string | null
  rows_processed: number
  rows_failed: number
  current_table: string
  created_at: string
  updated_at: string
}

export interface DriftItem {
  table: string
  column?: string
  message: string
}

export interface DriftReport {
  blocking_dest: DriftItem[]
  blocking_source: DriftItem[]
  auto_handled_dest: DriftItem[]
  auto_handled_src: DriftItem[]
}

export interface SSEMessage {
  type: 'progress' | 'row_failed' | 'done' | 'cancelled' | 'error' | 'snapshot'
  session_id: string
  data: {
    processed?: number
    failed?: number
    table?: string
    error_msg?: string
    friendly_msg?: string
    column?: string
    value?: string
    code?: number
  }
  timestamp: string
}