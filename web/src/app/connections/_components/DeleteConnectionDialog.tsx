"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import type { Connection } from "@/types/Connection";
import { connectionService } from "@/lib/services/connections";
import { toast } from "sonner";
import { ApiError } from "@/lib/apiClient";
import { AlertCircleIcon } from "lucide-react";

interface DeleteConnectionDialogProps {
  connection: Connection | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDeleted: () => void;
}

export function DeleteConnectionDialog({
  connection,
  open,
  onOpenChange,
  onDeleted,
}: DeleteConnectionDialogProps) {
  const [loading, setLoading] = useState(false);
  const [cascade, setCascade] = useState(false);
  const [errorDetails, setErrorDetails] = useState<{
    code: string;
    message: string;
    profiles?: string[];
  } | null>(null);

  const handleDelete = async () => {
    if (!connection) return;

    setLoading(true);
    setErrorDetails(null);
    try {
      await connectionService.delete(connection.id, { cascade });
      toast.success("Koneksi berhasil dihapus");
      onDeleted();
      onOpenChange(false);
    } catch (error: unknown) {
      if (error instanceof ApiError && error.status === 409) {
        const details = error.details as { profiles?: string[] } | undefined;
        setErrorDetails({
          code: error.code,
          message: error.message,
          profiles: details?.profiles,
        });
      } else {
        const message =
          error instanceof Error ? error.message : "Gagal menghapus koneksi";
        toast.error(message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Hapus Koneksi</DialogTitle>
          <DialogDescription>
            Tindakan ini tidak bisa dibatalkan.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <p className="text-sm">
            Apakah Anda yakin ingin menghapus koneksi{" "}
            <span className="font-semibold text-destructive">
              &quot;{connection?.name}&quot;
            </span>
            ?
          </p>

          {errorDetails && (
            <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-md flex gap-3">
              <AlertCircleIcon className="h-5 w-5 text-destructive shrink-0" />
              <div className="space-y-2">
                <p className="text-sm font-medium text-destructive">
                  {errorDetails.code === "conflict_running_session"
                    ? "Tidak bisa dihapus: ada sinkronisasi aktif."
                    : "Koneksi ini sedang digunakan."}
                </p>
                <p className="text-xs text-text-muted">
                  {errorDetails.message}
                </p>
                {errorDetails.profiles && errorDetails.profiles.length > 0 && (
                  <div className="space-y-1">
                    <p className="text-xs font-semibold">Profile terdampak:</p>
                    <ul className="text-xs list-disc list-inside text-text-muted">
                      {errorDetails.profiles.map((p) => (
                        <li key={p}>{p}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          )}

          {(!errorDetails || errorDetails.code === "conflict_referenced") && (
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="cascade"
                checked={cascade}
                onChange={(e) => setCascade(e.target.checked)}
                className="w-4 h-4 rounded border-border text-primary focus:ring-primary cursor-pointer"
              />
              <Label htmlFor="cascade" className="text-sm cursor-pointer">
                Hapus juga profile yang terhubung
              </Label>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            Batal
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={
              loading || errorDetails?.code === "conflict_running_session"
            }
          >
            {loading ? "Menghapus..." : "Ya, Hapus Koneksi"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
