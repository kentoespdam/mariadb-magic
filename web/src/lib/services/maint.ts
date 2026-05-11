import { apiGet, apiPost } from "../apiClient";

interface MaintStats {
  sessions_total: number;
  sessions_running: number;
  sessions_completed: number;
  rows_processed_total: number;
  rows_failed_total: number;
}

export const maintService = {
  stats: () => apiGet<MaintStats>("/api/maint/stats"),

  evict: () => apiPost<void>("/api/maint/evict", {}),
};
