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
import type { MappingProfile } from "@/types/MappingProfile";
import { profileService } from "@/lib/services/profiles";
import { toast } from "sonner";
import { ApiError } from "@/lib/apiClient";

interface DeleteProfileDialogProps {
  profile: MappingProfile | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDelete: () => void;
}

export function DeleteProfileDialog({
  profile,
  open,
  onOpenChange,
  onDelete,
}: DeleteProfileDialogProps) {
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    if (!profile) return;

    setLoading(true);
    try {
      await profileService.delete(profile.id);
      toast.success("Profile berhasil dihapus");
      onDelete();
      onOpenChange(false);
    } catch (error: unknown) {
      if (error instanceof ApiError && error.status === 409) {
        toast.error(
          error.message ||
            "Gagal menghapus profile: sedang digunakan dalam sesi aktif",
        );
      } else {
        const message =
          error instanceof Error ? error.message : "Gagal menghapus profile";
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
          <DialogTitle>Hapus Profile</DialogTitle>
          <DialogDescription>
            Tindakan ini tidak bisa dibatalkan.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <p className="text-sm">
            Apakah Anda yakin ingin menghapus profile{" "}
            <span className="font-semibold text-destructive">
              &quot;{profile?.name}&quot;
            </span>
            ? Semua pemetaan kolom dan aturan di dalamnya akan hilang permanen.
          </p>
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
            disabled={loading}
          >
            {loading ? "Menghapus..." : "Ya, Hapus Profile"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
