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

export interface SyncLogGroup {
  table_name: string;
  count: number;
  level: "info" | "warn" | "error";
}

export interface LogsResponse {
  items: SyncLog[];
  next_cursor: string | null;
}

export interface LogsParams {
  limit?: number;
  cursor?: string;
}
