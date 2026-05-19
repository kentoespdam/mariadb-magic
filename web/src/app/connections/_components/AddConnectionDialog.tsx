"use client";

import { useState } from "react";
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
import { toast } from "sonner";

const addSchema = connectionSchema.extend({
  password: z.string().min(1, "Password wajib diisi").max(500),
});

type AddFormInput = z.infer<typeof addSchema>;

interface AddConnectionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: () => void;
}

export function AddConnectionDialog({
  open,
  onOpenChange,
  onCreated,
}: AddConnectionDialogProps) {
  const [isTesting, setIsTesting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const form = useForm<AddFormInput>({
    resolver: zodResolver(addSchema),
    defaultValues: {
      name: "",
      host: "localhost",
      port: 3306,
      user: "root",
      database: "",
      password: "",
    },
  });

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

  const onSubmit = async (values: AddFormInput) => {
    setIsSaving(true);
    try {
      await connectionService.create(values as ConnectionFormInput);
      toast.success("Koneksi berhasil ditambahkan");
      form.reset();
      onCreated();
      onOpenChange(false);
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Gagal menambahkan koneksi";
      toast.error(message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Tambah Koneksi</DialogTitle>
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
              {isSaving ? "Simpan Koneksi" : "Simpan Koneksi"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
