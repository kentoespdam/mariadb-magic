export interface Connection {
  id: string;
  name: string;
  host: string;
  port: number;
  username: string;
  password?: string;
  database: string;
  ssl: boolean;
  last_test_status?: "ok" | "failed" | "untested";
  last_test_at?: string;
  created_at: string;
  updated_at: string;
}

export type ConnectionTestStatus = "ok" | "failed" | "untested";

export interface TestConnectionResult {
  status: ConnectionTestStatus;
  message?: string;
  error_code?: string;
}
