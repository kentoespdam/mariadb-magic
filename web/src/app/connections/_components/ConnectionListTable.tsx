"use client";

import { useState } from "react";
import { useConnections } from "@/hooks/useConnections";
import { LoadingBoundary } from "@/components/LoadingBoundary";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PencilIcon, Trash2Icon, RefreshCwIcon } from "lucide-react";
import type { Connection } from "@/types/Connection";
import { connectionService } from "@/lib/services/connections";
import { toast } from "sonner";
import { EditConnectionDialog } from "./EditConnectionDialog";
import { DeleteConnectionDialog } from "./DeleteConnectionDialog";

export function ConnectionListTable() {
  const { data: connections, isLoading, mutate } = useConnections();
  const [editingConn, setEditingConn] = useState<Connection | null>(null);
  const [deletingConn, setDeletingConn] = useState<Connection | null>(null);
  const [testingId, setTestingId] = useState<string | null>(null);

  const handleTest = async (id: string) => {
    setTestingId(id);
    try {
      const result = await connectionService.testPostSave(id);
      if (result.success) {
        toast.success("Koneksi berhasil!");
      } else {
        toast.error(`Koneksi gagal: ${result.error}`);
      }
      mutate();
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Gagal menguji koneksi";
      toast.error(message);
    } finally {
      setTestingId(null);
    }
  };

  if (isLoading) {
    return <LoadingBoundary variant="list-skeleton" />;
  }

  if (!connections || connections.length === 0) {
    return (
      <div className="text-center py-16 bg-surface-subtle rounded-xl border border-dashed flex flex-col items-center gap-4">
        <p className="text-sm text-text-muted italic">
          Belum ada koneksi tersimpan.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border bg-surface overflow-hidden">
      <Table>
        <TableHeader className="bg-muted/30">
          <TableRow>
            <TableHead className="px-4">Nama</TableHead>
            <TableHead>Host:Port</TableHead>
            <TableHead>User</TableHead>
            <TableHead>Database</TableHead>
            <TableHead>Status Tes</TableHead>
            <TableHead className="text-right px-4">Aksi</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {connections.map((c) => (
            <TableRow key={c.id} className="group transition-colors">
              <TableCell className="font-semibold px-4">{c.name}</TableCell>
              <TableCell className="text-sm font-mono text-text-muted">
                {c.host}:{c.port}
              </TableCell>
              <TableCell className="text-sm text-text-muted">
                {c.user}
              </TableCell>
              <TableCell className="text-sm text-text-muted">
                {c.database}
              </TableCell>
              <TableCell>
                <StatusBadge
                  type="connection"
                  status={c.last_test_status || "unknown"}
                />
              </TableCell>
              <TableCell className="text-right px-4">
                <div className="flex justify-end gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-text-muted hover:text-primary opacity-60 group-hover:opacity-100"
                    onClick={() => handleTest(c.id)}
                    disabled={testingId === c.id}
                    title="Tes Koneksi"
                  >
                    <RefreshCwIcon
                      className={`h-3.5 w-3.5 ${testingId === c.id ? "animate-spin" : ""}`}
                    />
                  </Button>

                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-text-muted hover:text-primary opacity-60 group-hover:opacity-100"
                    onClick={() => setEditingConn(c)}
                    title="Edit Koneksi"
                  >
                    <PencilIcon className="h-3.5 w-3.5" />
                  </Button>

                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-text-muted hover:text-destructive opacity-60 group-hover:opacity-100"
                    onClick={() => setDeletingConn(c)}
                    title="Hapus Koneksi"
                  >
                    <Trash2Icon className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <EditConnectionDialog
        connection={editingConn}
        open={!!editingConn}
        onOpenChange={(open) => !open && setEditingConn(null)}
        onSaved={() => mutate()}
      />

      <DeleteConnectionDialog
        connection={deletingConn}
        open={!!deletingConn}
        onOpenChange={(open) => !open && setDeletingConn(null)}
        onDeleted={() => mutate()}
      />
    </div>
  );
}
