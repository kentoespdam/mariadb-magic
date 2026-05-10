"use client";

import {
  AlertTriangle,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Download,
  PauseCircle,
  PlayCircle,
  RotateCcw,
  XCircle,
} from "lucide-react";
import { useState } from "react";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import type { SyncSession, SyncSessionStatus } from "@/types/SyncSession";

interface SessionDetailProps {
  session: SyncSession;
  onCancel?: () => void;
  onRerun?: () => void;
  onExportLog?: () => void;
  onViewDetails?: () => void;
}

const STATUS_ICONS: Record<SyncSessionStatus, React.ComponentType<{ className?: string }>> = {
  running: PlayCircle,
  done: CheckCircle2,
  interrupted: PauseCircle,
  failed: XCircle,
  cancelled: AlertTriangle,
};

function formatDuration(startedAt: string, finishedAt?: string): string {
  const start = new Date(startedAt).getTime();
  const end = finishedAt ? new Date(finishedAt).getTime() : Date.now();
  const diffMs = end - start;
  const diffSec = Math.floor(diffMs / 1000);
  const minutes = Math.floor(diffSec / 60);
  const seconds = diffSec % 60;
  return `${minutes}m ${seconds.toString().padStart(2, "0")}dtk`;
}

function formatTimestamp(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleString("id-ID", {
    dateStyle: "medium",
    timeStyle: "medium",
  });
}

function TableProgressItem({ table }: { table: SyncSession["tables"][0] }) {
  const [expanded, setExpanded] = useState(false);
  const percentage = table.total_rows > 0 ? (table.processed_rows / table.total_rows) * 100 : 0;

  return (
    <div className="border-b border-border last:border-b-0">
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="flex w-full items-center justify-between px-3 py-2.5 hover:bg-surface-subtle transition-colors"
      >
        <div className="flex items-center gap-3">
          {expanded ? (
            <ChevronDown className="h-4 w-4 text-text-muted" />
          ) : (
            <ChevronRight className="h-4 w-4 text-text-muted" />
          )}
          <span className="font-mono text-[13px]">{table.table_name}</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="font-mono text-[12px] text-text-muted">
            {table.processed_rows.toLocaleString("id-ID")}/
            {table.total_rows.toLocaleString("id-ID")}
          </span>
          <div className="w-20">
            <Progress value={percentage} className="h-1.5" />
          </div>
          <StatusBadge status={table.status} type="session" />
        </div>
      </button>
      {expanded && (
        <div className="px-6 pb-3">
          <div className="grid grid-cols-3 gap-4 rounded bg-surface-subtle p-3">
            <div>
              <p className="text-caption text-text-muted">Diproses</p>
              <p className="font-mono text-[14px]">
                {table.processed_rows.toLocaleString("id-ID")}
              </p>
            </div>
            <div>
              <p className="text-caption text-text-muted">Gagal</p>
              <p
                className={`font-mono text-[14px] ${table.failed_rows > 0 ? "text-error" : "text-text-muted"}`}
              >
                {table.failed_rows.toLocaleString("id-ID")}
              </p>
            </div>
            <div>
              <p className="text-caption text-text-muted">Persentase</p>
              <p className="font-mono text-[14px]">{percentage.toFixed(1)}%</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export function SessionDetail({
  session,
  onCancel,
  onRerun,
  onExportLog,
  onViewDetails,
}: SessionDetailProps) {
  const StatusIcon = STATUS_ICONS[session.status];
  const percentage =
    session.total_rows > 0 ? (session.processed_rows / session.total_rows) * 100 : 0;
  const canCancel = session.status === "running";
  const canRerun = ["failed", "interrupted", "cancelled"].includes(session.status);

  return (
    <Card>
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div
              className={`rounded-full p-2 ${
                session.status === "running"
                  ? "bg-info/10"
                  : session.status === "done"
                    ? "bg-success/10"
                    : session.status === "failed"
                      ? "bg-error/10"
                      : "bg-warning/10"
              }`}
            >
              <StatusIcon
                className={`h-5 w-5 ${
                  session.status === "running"
                    ? "text-info"
                    : session.status === "done"
                      ? "text-success"
                      : session.status === "failed"
                        ? "text-error"
                        : "text-warning"
                }`}
              />
            </div>
            <div>
              <CardTitle className="text-base">{session.profile_name}</CardTitle>
              <div className="mt-1 flex items-center gap-2">
                <StatusBadge status={session.status} type="session" />
                <span className="text-caption text-text-muted">
                  Dimulai {formatTimestamp(session.started_at)}
                </span>
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            {onCancel && canCancel && (
              <Button variant="outline" size="sm" onClick={onCancel}>
                Batalkan
              </Button>
            )}
            {onRerun && canRerun && (
              <Button variant="outline" size="sm" onClick={onRerun}>
                <RotateCcw className="mr-1.5 h-3.5 w-3.5" />
                Jalankan Ulang
              </Button>
            )}
            {onExportLog && (
              <Button variant="outline" size="sm" onClick={onExportLog}>
                <Download className="mr-1.5 h-3.5 w-3.5" />
                Export Log
              </Button>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-small text-text-secondary">Progress</span>
            <span className="font-mono text-[13px]">
              {session.processed_rows.toLocaleString("id-ID")} /{" "}
              {session.total_rows.toLocaleString("id-ID")} baris ({percentage.toFixed(1)}%)
            </span>
          </div>
          <div className="h-2.5 overflow-hidden rounded-full bg-muted">
            <div
              className={`h-full transition-all duration-300 ${
                session.status === "running"
                  ? "bg-primary"
                  : session.status === "done"
                    ? "bg-success"
                    : session.status === "failed"
                      ? "bg-error"
                      : "bg-warning"
              }`}
              style={{ width: `${percentage}%` }}
            />
          </div>
        </div>

        <div className="grid grid-cols-4 gap-4">
          <div className="rounded border border-border p-3">
            <p className="text-caption text-text-muted">Total Baris</p>
            <p className="font-mono text-[16px] font-semibold">
              {session.total_rows.toLocaleString("id-ID")}
            </p>
          </div>
          <div className="rounded border border-border p-3">
            <p className="text-caption text-text-muted">Diproses</p>
            <p className="font-mono text-[16px] font-semibold text-success">
              {session.processed_rows.toLocaleString("id-ID")}
            </p>
          </div>
          <div className="rounded border border-border p-3">
            <p className="text-caption text-text-muted">Gagal</p>
            <p
              className={`font-mono text-[16px] font-semibold ${session.failed_rows > 0 ? "text-error" : "text-text-muted"}`}
            >
              {session.failed_rows.toLocaleString("id-ID")}
            </p>
          </div>
          <div className="rounded border border-border p-3">
            <p className="text-caption text-text-muted">Durasi</p>
            <p className="font-mono text-[16px] font-semibold">
              {formatDuration(session.started_at, session.finished_at)}
            </p>
          </div>
        </div>

        {session.tables.length > 0 && (
          <div className="rounded border border-border">
            <div className="border-b border-border bg-surface-subtle px-3 py-2">
              <p className="text-small font-medium">Detail per Tabel</p>
            </div>
            <div>
              {session.tables.map((table, idx) => (
                <TableProgressItem key={idx} table={table} />
              ))}
            </div>
          </div>
        )}

        {session.error_message && (
          <div className="rounded border border-error/30 bg-error/5 p-3">
            <p className="text-small font-medium text-error">Error</p>
            <p className="mt-1 text-[13px] text-text-secondary">{session.error_message}</p>
          </div>
        )}

        {session.finished_at && (
          <div className="flex items-center justify-between border-t border-border pt-3">
            <span className="text-small text-text-muted">
              Selesai: {formatTimestamp(session.finished_at)}
            </span>
            {onViewDetails && (
              <Button variant="ghost" size="sm" onClick={onViewDetails}>
                Lihat Detail
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
