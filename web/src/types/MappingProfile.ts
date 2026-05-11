export type ProfileStatus = "draft" | "ready";

export interface ColumnPairing {
  source_table: string;
  source_column: string;
  dest_column: string;
  transform: "copy" | "constant" | "null" | "default";
  constant_value?: string;
}

export interface Rule {
  type: "whitelist" | "blacklist" | "transform" | "filter" | "validation";
  table: string;
  column?: string;
  config: Record<string, unknown>;
}

export interface MappingProfile {
  id: string;
  name: string;
  source_connection_id: string;
  dest_connection_id: string;
  selection_json: string;
  column_pairings_json: string;
  rules_json: string;
  status: ProfileStatus;
  created_at: string;
  updated_at: string;
}

export interface MappingProfileInput {
  name: string;
  source_connection_id: string;
  dest_connection_id: string;
  selection_json: string;
  column_pairings_json: string;
  rules_json: string;
}

export interface DriftReport {
  has_drift: boolean;
  drift_tables: DriftTable[];
}

export interface DriftTable {
  table_name: string;
  added_columns: string[];
  removed_columns: string[];
  type_changed_columns: string[];
}
