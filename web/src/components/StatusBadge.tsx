import { cn } from "@/lib/utils";
import type { SyncSessionStatus } from "@/types/SyncSession";
import type { ConnectionTestStatus } from "@/types/Connection";
import { getSessionStatusStyle, getProfileStatusStyle, getConnectionStatusStyle, getStatusLabel } from "@/lib/domainStatus";

interface StatusBadgeProps {
  status: SyncSessionStatus | ConnectionTestStatus | "draft" | "ready";
  type?: "session" | "profile" | "connection";
  className?: string;
}

export function StatusBadge({ status, type = "session", className }: StatusBadgeProps) {
  let config = getSessionStatusStyle(status as SyncSessionStatus);
  
  if (type === "profile") {
    config = getProfileStatusStyle(status as "draft" | "ready");
  } else if (type === "connection") {
    config = getConnectionStatusStyle(status as ConnectionTestStatus);
  }

  return (
    <span
      className={cn(
        "inline-flex items-center rounded px-2 py-0.5 text-xs font-medium tracking-wide",
        className
      )}
      style={{
        backgroundColor: config.background,
        color: config.text,
      }}
    >
      {getStatusLabel(status)}
    </span>
  );
}