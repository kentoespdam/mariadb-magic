/**
 * DualConnectionForm.tsx
 *
 * Form untuk mengkonfigurasi koneksi database sumber dan tujuan sekaligus.
 * Memastikan kedua koneksi valid sebelum disimpan.
 */

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { connectionSchema } from "./connection.schema";
import { connectionService } from "@/lib/services/connections";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ConnectionFieldGroup } from "./ConnectionFieldGroup";

const dualSchema = z.object({
  source: connectionSchema,
  destination: connectionSchema,
});

type DualFormValues = z.output<typeof dualSchema>;

export function DualConnectionForm({ onSuccess }: { onSuccess?: () => void }) {
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);
  const [testing, setTesting] = useState({ source: false, destination: false });
  const [error, setError] = useState<string | null>(null);

  const form = useForm<DualFormValues>({
    resolver: zodResolver(dualSchema),
    defaultValues: {
      source: { name: "Source DB", host: "", port: 3306, user: "", database: "" },
      destination: { name: "Dest DB", host: "", port: 3306, user: "", database: "" },
    },
  });

  const handleTest = async (prefix: "source" | "destination") => {
    const valid = await form.trigger(prefix);
    if (!valid) return;
    setTesting((prev) => ({ ...prev, [prefix]: true }));
    try {
      const res = await connectionService.testPreSave(form.getValues(prefix));
      alert(res.success ? "Koneksi berhasil!" : res.error || "Koneksi gagal");
    } finally {
      setTesting((prev) => ({ ...prev, [prefix]: false }));
    }
  };

  const onSubmit = async (values: DualFormValues) => {
    setIsSaving(true);
    setError(null);
    try {
      await connectionService.batchCreate(values);
      onSuccess?.();
      router.push("/");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      {error && (
        <div className="p-3 text-sm text-destructive bg-destructive/10 border border-destructive rounded">
          {error}
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="p-6">
          <ConnectionFieldGroup
            prefix="source"
            form={form}
            onTest={() => handleTest("source")}
            isTesting={testing.source}
          />
        </Card>
        <Card className="p-6">
          <ConnectionFieldGroup
            prefix="destination"
            form={form}
            onTest={() => handleTest("destination")}
            isTesting={testing.destination}
          />
        </Card>
      </div>

      <div className="flex justify-end gap-4">
        <Button variant="outline" type="button" onClick={() => router.push("/")}>
          Batal
        </Button>
        <Button type="submit" disabled={isSaving}>
          {isSaving ? "Menyimpan..." : "Simpan Koneksi"}
        </Button>
      </div>
    </form>
  );
}
