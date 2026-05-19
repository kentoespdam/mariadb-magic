"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  connectionSchema,
  type ConnectionFormInput,
} from "./connection.schema";
import { ConnectionFields } from "./ConnectionFields";
import { connectionService } from "@/lib/services/connections";
import type { Connection } from "@/types/Connection";
import { toast } from "sonner";

const editSchema = connectionSchema.extend({
  password: z.string().max(500).optional(),
});

type EditFormInput = z.infer<typeof editSchema>;

interface EditConnectionDialogProps {
  connection: Connection | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaved: () => void;
}

export function EditConnectionDialog({
  connection,
  open,
  onOpenChange,
  onSaved,
}: EditConnectionDialogProps) {
  const [isTesting, setIsTesting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const form = useForm<EditFormInput>({
    resolver: zodResolver(editSchema),
    defaultValues: {
      name: "",
      host: "",
      port: 3306,
      user: "",
      database: "",
      password: "",
    },
  });

  useEffect(() => {
    if (connection && open) {
      form.reset({
        name: connection.name,
        host: connection.host,
        port: connection.port,
        user: connection.user,
        database: connection.database,
        password: "", // Keep password empty by default on edit
      });
    }
  }, [connection, open, form]);

  const handleTest = async () => {
    const isValid = await form.trigger();
    if (!isValid) return;

    setIsTesting(true);
    try {
      const values = form.getValues();
      const result = await connectionService.testPreSave(
        values as ConnectionFormInput,
      );
      if (result.success) {
        toast.success("Koneksi berhasil!");
      } else {
        toast.error(`Koneksi gagal: ${result.error}`);
      }
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Gagal menguji koneksi";
      toast.error(message);
    } finally {
      setIsTesting(false);
    }
  };

  const onSubmit = async (values: EditFormInput) => {
    if (!connection) return;

    setIsSaving(true);
    try {
      // Send password only if it's not empty
      const updateData = {
        ...values,
        password: values.password || undefined,
      };
      await connectionService.update(connection.id, updateData);
      toast.success("Koneksi berhasil diperbarui");
      onSaved();
      onOpenChange(false);
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Gagal memperbarui koneksi";
      toast.error(message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Koneksi</DialogTitle>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
          <ConnectionFields
            form={form}
            onTest={handleTest}
            isTesting={isTesting}
          />

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSaving}
            >
              Batal
            </Button>
            <Button type="submit" disabled={isSaving}>
              {isSaving ? "Menyimpan..." : "Simpan Perubahan"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
