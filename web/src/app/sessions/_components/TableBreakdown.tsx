"use client";

import { useMemo } from "react";
import { SyncLog, SessionStatus } from "@/types/SyncSession";
import { useSessionLogs } from "@/hooks/useSessionLogs";
import { CheckCircle2Icon, AlertCircleIcon, Loader2Icon } from "lucide-react";

interface TableBreakdownProps {
  sessionId: string;
  status: SessionStatus;
  currentTable?: string;
  selection: { tables: string[] } | string[] | any;
}

export function TableBreakdown({
  sessionId,
  status,
  currentTable,
  selection,
}: TableBreakdownProps) {
  const { data: logsData } = useSessionLogs(sessionId, { limit: 500 });

  const tableLogs = useMemo(() => {
    const map: Record<string, SyncLog[]> = {};
    logsData?.items.forEach((log) => {
      if (!map[log.destination_table]) map[log.destination_table] = [];
      map[log.destination_table].push(log);
    });
    return map;
  }, [logsData]);

  const tables = useMemo(() => {
    if (!selection) return [];
    if (Array.isArray(selection)) return selection;
    if (selection.tables && Array.isArray(selection.tables)) return selection.tables;
    return [];
  }, [selection]);

  if (tables.length === 0) return null;

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Breakdown per Tabel</h3>
      <div className="grid gap-2">
        {tables.map((table: string) => {
          const logs = tableLogs[table] || [];
          const fatalError = logs.find((l) => l.mariadb_code === 0);
          const rowErrors = logs.filter((l) => l.mariadb_code !== 0);
          const isCurrent = currentTable === table && status === "running";

          let tableStatus = "pending";
          let statusColor = "text-muted-foreground";
          let statusText = "Menunggu";

          if (fatalError) {
            tableStatus = "failed";
            statusColor = "text-destructive";
            statusText = fatalError.friendly_msg || "Gagal (Fatal)";
          } else if (isCurrent) {
            tableStatus = "running";
            statusColor = "text-blue-500 font-medium";
            statusText = "Sedang diproses...";
          } else if (rowErrors.length > 0) {
            tableStatus = "partial";
            statusColor = "text-amber-500 font-medium";
            statusText = `Selesai (${rowErrors.length} baris gagal)`;
          } else if (
            status === "done" ||
            (currentTable && tables.indexOf(table) < tables.indexOf(currentTable))
          ) {
            tableStatus = "success";
            statusColor = "text-green-600 font-medium";
            statusText = "Selesai";
          }

          return (
            <div
              key={table}
              className="flex items-center justify-between p-3 border rounded-lg bg-card shadow-sm"
            >
              <div className="flex items-center gap-3">
                <StatusIconSmall status={tableStatus} />
                <span className="font-mono text-sm">{table}</span>
              </div>
              <span className={`text-xs ${statusColor}`}>{statusText}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function StatusIconSmall({ status }: { status: string }) {
  switch (status) {
    case "running":
      return <Loader2Icon className="h-4 w-4 animate-spin text-blue-500" />;
    case "success":
      return <CheckCircle2Icon className="h-4 w-4 text-green-500" />;
    case "failed":
      return <AlertCircleIcon className="h-4 w-4 text-destructive" />;
    case "partial":
      return <AlertCircleIcon className="h-4 w-4 text-amber-500" />;
    default:
      return <div className="h-4 w-4 rounded-full border-2 border-muted" />;
  }
}
