export type SessionStatus =
  | "pending"
  | "running"
  | "done"
  | "interrupted"
  | "failed"
  | "cancelled";

export interface SyncLog {
  id: string;
  session_id: string;
  destination_table: string;
  pk_json: string | null;
  problem_column: string | null;
  source_value: string | null;
  mariadb_code: number;
  technical_msg: string | null;
  friendly_msg: string | null;
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
  mariadb_code: number;
  count: number;
  friendly_summary: string;
}
