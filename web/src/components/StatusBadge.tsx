/**
 * StatusBadge.tsx
 *
 * Komponen untuk menampilkan badge status (Session, Profile, Connection)
 * sesuai dengan desain di DESIGN.md dan mapping di domainStatus.ts.
 */

import { getStatusConfig, type DomainStatusType } from "@/lib/domainStatus";
import { cn } from "@/lib/utils";

interface StatusBadgeProps {
  type: DomainStatusType;
  status: string;
  className?: string;
}

export function StatusBadge({ type, status, className }: StatusBadgeProps) {
  const config = getStatusConfig(type, status);

  const variants = {
    info: "bg-[#ECFEFF] text-[#0E7490] border-[#0891B2]/20",
    success: "bg-[#DCFCE7] text-[#15803D] border-[#16A34A]/20",
    warning: "bg-[#FEF3C7] text-[#92400E] border-[#D97706]/20",
    error: "bg-[#FEE2E2] text-[#991B1B] border-[#DC2626]/20",
    muted: "bg-[#F1F5F9] text-[#475569] border-[#E2E8F0]",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-0.5 rounded-sm text-xs font-medium border",
        variants[config.variant],
        className,
      )}
    >
      {config.label}
    </span>
  );
}
