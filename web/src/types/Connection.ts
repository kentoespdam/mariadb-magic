export interface Connection {
  id: string;
  name: string;
  host: string;
  port: number;
  user: string;
  database: string;
  has_password: boolean;
  last_test_status?: "ok" | "failed";
  last_test_error?: string;
}

export interface ConnectionInput {
  name: string;
  host: string;
  port: number;
  user: string;
  database: string;
  password?: string;
}

export interface ConnectionUpdateInput extends Partial<ConnectionInput> {}
