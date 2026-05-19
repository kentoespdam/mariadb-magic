"use client";

import { useMemo } from "react";
import { SyncLog } from "@/types/SyncSession";
import { useSessionLogs } from "@/hooks/useSessionLogs";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface SessionErrorListProps {
  sessionId: string;
}

export function SessionErrorList({ sessionId }: SessionErrorListProps) {
  const { data: logsData } = useSessionLogs(sessionId, { limit: 500 });

  const fatalErrors = useMemo(() => {
    if (!logsData?.items) return [];
    // mariadb_code 0 usually means fatal/system error for the table in this project
    return logsData.items.filter((l) => l.mariadb_code === 0);
  }, [logsData]);

  if (fatalErrors.length === 0) return null;

  return (
    <Card className="border-destructive/20 bg-destructive/5 overflow-hidden">
      <div className="bg-destructive/10 px-4 py-2 border-b border-destructive/20">
        <h3 className="text-sm font-semibold text-destructive">Error per Tabel</h3>
      </div>
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead className="w-[200px]">Tabel</TableHead>
            <TableHead>Pesan Error</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {fatalErrors.map((log) => (
            <TableRow key={log.id} className="hover:bg-destructive/5">
              <TableCell className="font-mono text-xs">{log.destination_table}</TableCell>
              <TableCell className="text-xs text-destructive font-medium">
                {log.friendly_msg || log.technical_msg || "Unknown error"}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  );
}
