import { useState, useEffect } from "react";
import { SyncSession, SyncLog } from "../types/SyncSession";

interface SseEvent {
  type: string;
  session_id: string;
  data: {
    table?: string;
    processed?: number;
    failed?: number;
    column?: string;
    value?: string;
    code?: number;
    friendly_msg?: string;
    error_msg?: string;
  };
}

export function useSseSession(sessionId: string | null) {
  const [progress, setProgress] = useState<{
    processed: number;
    failed: number;
    currentTable?: string;
    status: string;
    errorMsg?: string;
  }>({
    processed: 0,
    failed: 0,
    status: "pending",
  });

  const [logs, setLogs] = useState<SyncLog[]>([]);

  useEffect(() => {
    if (!sessionId) return;

    const eventSource = new EventSource(`/api/sse/${sessionId}`);

    eventSource.onmessage = (event) => {
      try {
        const payload: SseEvent = JSON.parse(event.data);
        const { type, data } = payload;

        switch (type) {
          case "snapshot":
          case "progress":
            setProgress((prev) => ({
              ...prev,
              processed: data.processed ?? prev.processed,
              failed: data.failed ?? prev.failed,
              currentTable: data.table ?? prev.currentTable,
              status: "running",
              errorMsg: data.error_msg,
            }));
            break;

          case "row_failed":
            setProgress((prev) => ({
              ...prev,
              failed: data.failed ?? prev.failed,
            }));
            // Add to temporary logs list if needed
            break;

          case "done":
            setProgress((prev) => ({
              ...prev,
              processed: data.processed ?? prev.processed,
              failed: data.failed ?? prev.failed,
              status: "done",
            }));
            eventSource.close();
            break;

          case "cancelled":
            setProgress((prev) => ({
              ...prev,
              status: "cancelled",
            }));
            eventSource.close();
            break;

          case "error":
            setProgress((prev) => ({
              ...prev,
              status: "failed",
              errorMsg: data.error_msg,
            }));
            eventSource.close();
            break;
        }
      } catch (e) {
        console.error("Failed to parse SSE event", e);
      }
    };

    eventSource.onerror = () => {
      console.error("SSE connection error");
      eventSource.close();
    };

    return () => {
      eventSource.close();
    };
  }, [sessionId]);

  return { progress, logs };
}
