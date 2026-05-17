/**
 * PreflightPanel.tsx
 *
 * Panel untuk menampilkan laporan schema drift secara live (ADR-0006).
 * Mendeteksi perbedaan antara source dan destination secara real-time.
 */

"use client";

import useSWR from "swr";
import { profileService } from "@/lib/services/profiles";
import { LoadingBoundary } from "@/components/LoadingBoundary";
import {
  TriangleAlertIcon,
  CircleCheckIcon,
  InfoIcon,
  ShieldCheckIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { DriftItem } from "@/types/MappingProfile";

export function PreflightPanel({ profileId }: { profileId: string }) {
  const { data: report, isLoading } = useSWR(
    `/api/profiles/${profileId}/preflight`,
    () => profileService.preflight(profileId),
    { refreshInterval: 30000 },
  );

  if (isLoading) return <LoadingBoundary variant="report-skeleton" />;
  if (!report) return null;

  const hasBlocking =
    report.blocking_dest.length > 0 || report.blocking_source.length > 0;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-text-secondary uppercase tracking-wider">
          Schema Drift Report (Live)
        </h3>
        {report.is_ready_eligible ? (
          <span className="text-[10px] text-success flex items-center gap-1 font-bold uppercase tracking-tight">
            <ShieldCheckIcon className="h-3 w-3" /> Schema Sync
          </span>
        ) : (
          <span className="text-[10px] text-destructive flex items-center gap-1 font-bold uppercase tracking-tight">
            <TriangleAlertIcon className="h-3 w-3" /> Drift Detected
          </span>
        )}
      </div>

      <div className="rounded-lg border bg-surface overflow-hidden divide-y divide-border/50">
        {/* Blocking Errors */}
        {report.blocking_dest.map((item, i) => (
          <DriftRow
            key={`dest-${i}-${item.table}`}
            item={item}
            variant="destructive"
          />
        ))}
        {report.blocking_source.map((item, i) => (
          <DriftRow
            key={`src-${i}-${item.table}`}
            item={item}
            variant="destructive"
          />
        ))}

        {/* Auto Handled Items (Warnings) */}
        {report.auto_handled_dest.map((item, i) => (
          <DriftRow
            key={`ah-dest-${i}-${item.table}`}
            item={item}
            variant="warning"
          />
        ))}
        {report.auto_handled_src.map((item, i) => (
          <DriftRow
            key={`ah-src-${i}-${item.table}`}
            item={item}
            variant="warning"
          />
        ))}

        {!hasBlocking &&
          report.auto_handled_dest.length === 0 &&
          report.auto_handled_src.length === 0 && (
            <div className="px-4 py-10 text-center space-y-2">
              <div className="flex justify-center">
                <CircleCheckIcon className="h-8 w-8 text-success/40" />
              </div>
              <p className="text-sm text-text-muted italic">
                Skema sinkron. Tidak ada perbedaan struktur terdeteksi antara
                Source dan Destination.
              </p>
            </div>
          )}
      </div>

      {hasBlocking && (
        <div className="flex items-start gap-2 px-1">
          <InfoIcon className="h-3.5 w-3.5 text-text-muted mt-0.5 shrink-0" />
          <p className="text-[10px] text-text-muted leading-relaxed">
            Perubahan skema pada basis data fisik dapat membatalkan validasi
            profil. Pastikan skema tujuan memiliki kolom yang dibutuhkan oleh
            pemetaan ini.
          </p>
        </div>
      )}
    </div>
  );
}

function DriftRow({
  item,
  variant,
}: {
  item: DriftItem;
  variant: "destructive" | "warning";
}) {
  return (
    <div
      className={cn(
        "px-4 py-3 flex items-start gap-3 transition-colors",
        variant === "destructive"
          ? "bg-destructive/[0.03] hover:bg-destructive/[0.06]"
          : "bg-warning/[0.03] hover:bg-warning/[0.06]",
      )}
    >
      <TriangleAlertIcon
        className={cn(
          "h-4 w-4 mt-0.5 shrink-0",
          variant === "destructive" ? "text-destructive" : "text-warning",
        )}
      />
      <div className="flex-1 space-y-1">
        <div className="flex items-center gap-2">
          <p className="text-sm font-semibold tracking-tight">
            {item.table}
            {item.column ? (
              <span className="text-text-muted">.{item.column}</span>
            ) : (
              ""
            )}
          </p>
          <span
            className={cn(
              "text-[9px] px-1 rounded font-bold uppercase",
              variant === "destructive"
                ? "bg-destructive/10 text-destructive"
                : "bg-warning/10 text-warning-foreground",
            )}
          >
            {variant === "destructive" ? "Blocking" : "Drift"}
          </span>
        </div>
        <p className="text-xs text-text-muted leading-normal">{item.message}</p>
        {item.action && (
          <div className="pt-1 flex items-center gap-1.5">
            <span className="text-[9px] font-bold text-text uppercase tracking-wider">
              Tindakan:
            </span>
            <span className="text-[10px] font-medium text-primary">
              {item.action}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
