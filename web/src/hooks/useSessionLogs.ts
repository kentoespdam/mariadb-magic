"use client";

import useSWR from "swr";
import { sessionService } from "@/lib/services/sessions";
import { LogsParams } from "@/types/SyncSession";

export function useSessionLogs(sessionId: string | null, params?: LogsParams) {
  return useSWR(
    sessionId ? [`/api/sessions/${sessionId}/logs`, params] : null,
    () => sessionService.logs(sessionId!, params)
  );
}
