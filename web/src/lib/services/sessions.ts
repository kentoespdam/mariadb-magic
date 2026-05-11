import { apiGet, apiPost } from "../apiClient";
import type {
  SyncSession,
  SessionCreateInput,
  LogsResponse,
  SyncLogGroup,
} from "../../types/SyncSession";

export const sessionService = {
  list: () => apiGet<SyncSession[]>("/api/sessions/"),

  get: (id: string) => apiGet<SyncSession>(`/api/sessions/${id}`),

  start: (profileId: string) =>
    apiPost<SyncSession, SessionCreateInput>("/api/sessions/", {
      profile_id: profileId,
    }),

  cancel: (id: string) => apiPost<void>(`/api/sessions/${id}/cancel`, {}),

  logs: (id: string, params?: { limit?: number; cursor?: string }) => {
    const searchParams = new URLSearchParams();
    if (params?.limit) searchParams.set("limit", String(params.limit));
    if (params?.cursor) searchParams.set("cursor", params.cursor);
    const qs = searchParams.toString();
    return apiGet<LogsResponse>(
      `/api/sessions/${id}/logs${qs ? `?${qs}` : ""}`,
    );
  },

  logsGroups: (id: string) =>
    apiGet<SyncLogGroup[]>(`/api/sessions/${id}/logs/groups`),

  logsCsvUrl: (id: string) => `/api/sessions/${id}/logs.csv`,
};
