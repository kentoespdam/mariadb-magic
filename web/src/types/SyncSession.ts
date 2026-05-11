export type SessionStatus =
  | "pending"
  | "running"
  | "completed"
  | "failed"
  | "cancelled";

export interface SyncLog {
  id: string;
  session_id: string;
  level: "info" | "warn" | "error";
  message: string;
  table_name?: string;
  row_data?: Record<string, unknown>;
  mariadb_code?: string;
  created_at: string;
}

export interface SyncSession {
  id: string;
  profile_id: string;
  profile_snapshot_json: Record<string, unknown>;
  status: SessionStatus;
  started_at: string;
  ended_at?: string;
  rows_processed: number;
  rows_failed: number;
  current_table?: string;
  created_at: string;
  updated_at: string;
}

export interface SessionCreateInput {
  profile_id: string;
}

export interface LogsResponse {
  items: SyncLog[];
  next_cursor: string | null;
}

export interface LogsParams {
  limit?: number;
  cursor?: string;
}

export interface SyncLogGroup {
  table_name: string;
  count: number;
  level: "info" | "warn" | "error";
}
