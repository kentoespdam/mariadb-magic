import type { ConnectionTestStatus } from "@/types/Connection";
import type { SyncSessionStatus } from "@/types/SyncSession";

type StatusConfig = {
  background: string;
  text: string;
};

const SESSION_STATUS_MAP: Record<SyncSessionStatus, StatusConfig> = {
  running: { background: "#ecfeff", text: "#0e7490" },
  done: { background: "#dcfce7", text: "#15803d" },
  interrupted: { background: "#fef3c7", text: "#92400e" },
  failed: { background: "#fee2e2", text: "#991b1b" },
  cancelled: { background: "#f1f5f9", text: "#475569" },
};

const PROFILE_STATUS_MAP: Record<"draft" | "ready", StatusConfig> = {
  draft: { background: "#fef3c7", text: "#92400e" },
  ready: { background: "#dcfce7", text: "#15803d" },
};

const CONNECTION_STATUS_MAP: Record<ConnectionTestStatus, StatusConfig> = {
  untested: { background: "#f1f5f9", text: "#475569" },
  ok: { background: "#dcfce7", text: "#15803d" },
  failed: { background: "#fee2e2", text: "#991b1b" },
};

export function getSessionStatusStyle(status: SyncSessionStatus): StatusConfig {
  return SESSION_STATUS_MAP[status];
}

export function getProfileStatusStyle(status: "draft" | "ready"): StatusConfig {
  return PROFILE_STATUS_MAP[status];
}

export function getConnectionStatusStyle(status: ConnectionTestStatus): StatusConfig {
  return CONNECTION_STATUS_MAP[status];
}

export function getStatusLabel(
  status: SyncSessionStatus | ConnectionTestStatus | "draft" | "ready"
): string {
  const labels: Record<string, string> = {
    running: "Berjalan",
    done: "Selesai",
    interrupted: "Terhenti",
    failed: "Gagal",
    cancelled: "Dibatalkan",
    draft: "Draft",
    ready: "Siap",
    ok: "OK",
    untested: "Belum Tes",
  };
  return labels[status] || status;
}
