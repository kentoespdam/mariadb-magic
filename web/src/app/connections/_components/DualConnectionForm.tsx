"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { connectionSchema } from "./connection.schema";
import type { ConnectionInput } from "@/types/Connection";
import { connectionService } from "@/lib/services/connections";

const dualConnectionSchema = z.object({
  source: connectionSchema,
  destination: connectionSchema,
});

type DualFormInput = z.input<typeof dualConnectionSchema>;
type DualFormValues = z.output<typeof dualConnectionSchema>;

interface DualConnectionFormProps {
  onSuccess?: () => void;
}

export function DualConnectionForm({ onSuccess }: DualConnectionFormProps) {
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);
  const [isTestingSource, setIsTestingSource] = useState(false);
  const [isTestingDest, setIsTestingDest] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<DualFormInput, unknown, DualFormValues>({
    resolver: zodResolver(dualConnectionSchema),
    defaultValues: {
      source: {
        name: "",
        host: "",
        port: 3306,
        user: "",
        password: "",
        database: "",
      },
      destination: {
        name: "",
        host: "",
        port: 3306,
        user: "",
        password: "",
        database: "",
      },
    },
  });

  async function handleTestSource() {
    const valid = await form.trigger("source");
    if (!valid) return;
    setIsTestingSource(true);
    try {
      const values = form.getValues("source") as unknown as ConnectionInput;
      const result = await connectionService.testPreSave(values);
      if (!result.success) {
        alert(result.error ?? "Koneksi gagal");
      } else {
        alert("Koneksi berhasil!");
      }
    } finally {
      setIsTestingSource(false);
    }
  }

  async function handleTestDest() {
    const valid = await form.trigger("destination");
    if (!valid) return;
    setIsTestingDest(true);
    try {
      const values = form.getValues("destination") as unknown as ConnectionInput;
      const result = await connectionService.testPreSave(values);
      if (!result.success) {
        alert(result.error ?? "Koneksi gagal");
      } else {
        alert("Koneksi berhasil!");
      }
    } finally {
      setIsTestingDest(false);
    }
  }

  async function onSubmit(values: DualFormValues) {
    setIsSaving(true);
    setError(null);
    try {
      await connectionService.batchCreate({
        source: values.source,
        destination: values.destination,
      });
      onSuccess?.();
      router.push("/");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan");
    } finally {
      setIsSaving(false);
    }
  }

  function ConnectionFields({
    prefix,
  }: {
    prefix: "source" | "destination";
  }) {
    const isSource = prefix === "source";
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-medium">
          {isSource ? "Database Sumber" : "Database Tujuan"}
        </h3>

        <div>
          <label className="block text-sm font-medium mb-1">Nama Koneksi</label>
          <input
            {...form.register(`${prefix}.name`)}
            placeholder={isSource ? "Source DB" : "Destination DB"}
            className="w-full p-2 border rounded"
          />
          {form.formState.errors[prefix as "source" | "destination"] && (
            <p className="text-sm text-red-500 mt-1">
              {(form.formState.errors[prefix as "source" | "destination"] as any)?.name?.message ||
               (form.formState.errors[prefix as "source" | "destination"] as any)?.message}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Host</label>
          <input
            {...form.register(`${prefix}.host`)}
            placeholder="localhost"
            className="w-full p-2 border rounded"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Port</label>
          <input
            type="number"
            {...form.register(`${prefix}.port`, { valueAsNumber: true })}
            placeholder="3306"
            className="w-full p-2 border rounded"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Username</label>
          <input
            {...form.register(`${prefix}.user`)}
            placeholder="root"
            className="w-full p-2 border rounded"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Password</label>
          <input
            type="password"
            {...form.register(`${prefix}.password`)}
            placeholder="••••••••"
            className="w-full p-2 border rounded"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Database</label>
          <input
            {...form.register(`${prefix}.database`)}
            placeholder={isSource ? "source_db" : "dest_db"}
            className="w-full p-2 border rounded"
          />
        </div>

        <button
          type="button"
          onClick={isSource ? handleTestSource : handleTestDest}
          disabled={isSource ? isTestingSource : isTestingDest}
          className="w-full p-2 border rounded hover:bg-gray-50 disabled:opacity-50"
        >
          {isSource ? (isTestingSource ? "Menguji..." : "Test Koneksi") : (isTestingDest ? "Menguji..." : "Test Koneksi")}
        </button>
      </div>
    );
  }

  return (
    <div>
      {error && (
        <div className="rounded border border-red-500 bg-red-50 p-3 text-sm text-red-600 mb-4">
          {error}
        </div>
      )}
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid gap-6 md:grid-cols-2">
          <div className="rounded-lg border p-6 space-y-4">
            <ConnectionFields prefix="source" />
          </div>

          <div className="rounded-lg border p-6 space-y-4">
            <ConnectionFields prefix="destination" />
          </div>
        </div>

        <div className="flex justify-end gap-4">
          <button
            type="button"
            onClick={() => router.push("/")}
            className="px-4 py-2 border rounded hover:bg-gray-50"
          >
            Batal
          </button>
          <button
            type="submit"
            disabled={isSaving}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {isSaving ? "Menyimpan..." : "Simpan Koneksi"}
          </button>
        </div>
      </form>
    </div>
  );
}
