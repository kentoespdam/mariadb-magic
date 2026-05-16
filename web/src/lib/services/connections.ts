import { apiGet, apiPost, apiPut, apiDelete } from "../apiClient";
import type {
  Connection,
  ConnectionInput,
  ConnectionUpdateInput,
} from "../../types/Connection";

export interface TestResult {
  success: boolean;
  error?: string;
}

export const connectionService = {
  list: () => apiGet<Connection[]>("/api/connections/"),

  get: (id: string) => apiGet<Connection>(`/api/connections/${id}`),

  create: (input: ConnectionInput) =>
    apiPost<Connection, ConnectionInput>("/api/connections/", input),

  batchCreate: (input: {
    source: ConnectionInput;
    destination: ConnectionInput;
  }) =>
    apiPost<
      { source: Connection; destination: Connection },
      { source: ConnectionInput; destination: ConnectionInput }
    >("/api/connections/batch", input),

  update: (id: string, input: ConnectionUpdateInput) =>
    apiPut<Connection, ConnectionUpdateInput>(`/api/connections/${id}`, input),

  delete: (id: string, opts?: { cascade?: boolean }) => {
    const params = opts?.cascade ? "?cascade=true" : "";
    return apiDelete<void>(`/api/connections/${id}${params}`);
  },

  testPreSave: (input: ConnectionInput) =>
    apiPost<TestResult, ConnectionInput>("/api/connections/test", input),

  testPostSave: (id: string) =>
    apiGet<TestResult>(`/api/connections/${id}/test`),
};
