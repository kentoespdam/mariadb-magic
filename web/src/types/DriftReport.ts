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
