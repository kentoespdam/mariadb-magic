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
  selection_json: string
  column_pairings_json: string
  rules_json: string
}

export interface ValidationError {
  Table: string
  Column: string
  Message: string
}

export interface MarkReadyResponse {
  valid: boolean
  errors?: ValidationError[]
}