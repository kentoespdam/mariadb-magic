export type SyncSessionStatus = "running" | "done" | "interrupted" | "failed" | "cancelled";

export interface SyncSession {
  id: string;
  profile_id: string;
  profile_name: string;
  status: SyncSessionStatus;
  started_at: string;
  finished_at?: string;
  total_rows: number;
  processed_rows: number;
  failed_rows: number;
  error_message?: string;
  tables: TableProgress[];
}

export interface TableProgress {
  table_name: string;
  total_rows: number;
  processed_rows: number;
  failed_rows: number;
  status: SyncSessionStatus;
}