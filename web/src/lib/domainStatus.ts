/**
 * domainStatus.ts
 *
 * Mapping dari status domain (SyncSession, MappingProfile, Connection)
 * ke token desain (warna, label). Selaras dengan DESIGN.md.
 */

export type DomainStatusType = "session" | "profile" | "connection";

export interface StatusConfig {
  label: string;
  variant: "info" | "success" | "warning" | "error" | "muted";
  // Hex codes from DESIGN.md for reference, but we use Tailwind classes
  bg?: string;
  text?: string;
}

const SESSION_STATUS: Record<string, StatusConfig> = {
  running: { label: "Running", variant: "info" },
  done: { label: "Done", variant: "success" },
  interrupted: { label: "Interrupted", variant: "warning" },
  failed: { label: "Failed", variant: "error" },
  cancelled: { label: "Cancelled", variant: "muted" },
};

const PROFILE_STATUS: Record<string, StatusConfig> = {
  draft: { label: "Draft", variant: "warning" },
  ready: { label: "Ready", variant: "success" },
};

const CONNECTION_STATUS: Record<string, StatusConfig> = {
  untested: { label: "Untested", variant: "muted" },
  ok: { label: "OK", variant: "success" },
  failed: { label: "Failed", variant: "error" },
};

export function getStatusConfig(
  type: DomainStatusType,
  status: string,
): StatusConfig {
  const normalizedStatus = status.toLowerCase();
  let config: StatusConfig | undefined;

  switch (type) {
    case "session":
      config = SESSION_STATUS[normalizedStatus];
      break;
    case "profile":
      config = PROFILE_STATUS[normalizedStatus];
      break;
    case "connection":
      config = CONNECTION_STATUS[normalizedStatus];
      break;
  }

  return (
    config ?? {
      label: status,
      variant: "muted",
    }
  );
}
