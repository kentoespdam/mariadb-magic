export interface SyncLog {
  id: string;
  session_id: string;
  table_name: string;
  mariadb_code?: string;
  mariadb_message?: string;
  pk_value?: string;
  row_data?: string;
  created_at: string;
}

export interface SyncLogGroup {
  mariadb_code: string;
  mariadb_message: string;
  count: number;
  logs: SyncLog[];
}