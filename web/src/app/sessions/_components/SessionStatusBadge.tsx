"use client";

import { SessionStatus } from "@/types/SyncSession";
import { cn } from "@/lib/utils";
import {
  CheckCircle2Icon,
  AlertCircleIcon,
  Loader2Icon,
  XCircleIcon,
} from "lucide-react";

interface SessionStatusBadgeProps {
  status: SessionStatus;
  className?: string;
}

export function SessionStatusBadge({ status, className }: SessionStatusBadgeProps) {
  const variants = {
    running: "bg-[#ECFEFF] text-[#0E7490] border-[#0891B2]/20",
    done: "bg-[#DCFCE7] text-[#15803D] border-[#16A34A]/20",
    interrupted: "bg-[#FEF3C7] text-[#92400E] border-[#D97706]/20",
    failed: "bg-[#FEE2E2] text-[#991B1B] border-[#DC2626]/20",
    cancelled: "bg-[#F1F5F9] text-[#475569] border-[#E2E8F0]",
    pending: "bg-[#F1F5F9] text-[#475569] border-[#E2E8F0]",
  };

  const labels = {
    running: "Sedang Berjalan",
    done: "Selesai",
    failed: "Gagal",
    cancelled: "Dibatalkan",
    interrupted: "Terinterupsi",
    pending: "Menunggu",
  };

  const icons = {
    running: <Loader2Icon className="h-3.5 w-3.5 animate-spin" />,
    done: <CheckCircle2Icon className="h-3.5 w-3.5" />,
    failed: <AlertCircleIcon className="h-3.5 w-3.5" />,
    cancelled: <XCircleIcon className="h-3.5 w-3.5" />,
    interrupted: <AlertCircleIcon className="h-3.5 w-3.5" />,
    pending: null,
  };

  const variantClass = variants[status] || variants.pending;
  const label = labels[status] || status;
  const icon = icons[status] || null;

  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-0.5 rounded-sm text-xs font-medium border gap-1.5",
        variantClass,
        className
      )}
    >
      {icon}
      {label}
    </span>
  );
}
