/**
 * TablePicker.tsx
 *
 * Komponen untuk memilih tabel yang akan disertakan dalam sinkronisasi.
 * Menangani dependensi otomatis (closure) via backend Advisor.
 */

"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import type { SchemaResponse } from "@/types/MappingProfile";
import { profileService } from "@/lib/services/profiles";
import { mutate } from "swr";
import { cn } from "@/lib/utils";

interface TablePickerProps {
  profileId: string;
  schema: SchemaResponse;
}

export function TablePicker({ profileId, schema }: TablePickerProps) {
  const [selected, setSelected] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  // Sync state lokal saat schema berubah
  useEffect(() => {
    setSelected(
      schema.tables
        .filter((t) => t.role === "user_selected")
        .map((t) => t.name),
    );
  }, [schema]);

  const toggleTable = (name: string) => {
    setSelected((prev) =>
      prev.includes(name) ? prev.filter((t) => t !== name) : [...prev, name],
    );
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await profileService.update(profileId, { tables: selected });
      // Mutate baik profil maupun schema karena schema terikat pada selection_json profil
      await Promise.all([
        mutate(`/api/profiles/${profileId}`),
        mutate(`/api/profiles/${profileId}/schema`),
      ]);
    } catch (error) {
      console.error("Gagal menyimpan seleksi tabel:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const advisorTables = schema.tables
    .filter((t) => t.role === "advisor_added")
    .map((t) => t.name);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-text-secondary uppercase tracking-wider">
          Seleksi Tabel
        </h3>
        <Button
          size="sm"
          variant="outline"
          onClick={handleSave}
          disabled={isSaving}
          className="h-8 text-xs"
        >
          {isSaving ? "Menyimpan..." : "Simpan Seleksi"}
        </Button>
      </div>

      <div className="rounded-lg border bg-surface-subtle overflow-hidden">
        <div className="max-h-[500px] overflow-y-auto divide-y divide-border">
          {schema.available_tables.map((tableName) => {
            const isSelected = selected.includes(tableName);
            const isAdvisor = advisorTables.includes(tableName);
            const isChecked = isSelected || isAdvisor;

            return (
              <label
                key={tableName}
                className={cn(
                  "flex items-center px-4 py-2.5 gap-3 hover:bg-surface transition-colors cursor-pointer group",
                  isAdvisor && "bg-blue-50/30",
                )}
              >
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={() => !isAdvisor && toggleTable(tableName)}
                  disabled={isAdvisor}
                  className="w-4 h-4 rounded border-border text-primary focus:ring-primary disabled:opacity-50"
                />
                <div className="flex flex-col">
                  <span
                    className={cn(
                      "text-sm font-medium",
                      isAdvisor && "text-blue-700",
                      !isChecked && "text-text-muted",
                    )}
                  >
                    {tableName}
                  </span>
                  {isAdvisor && (
                    <span className="text-[10px] text-blue-600/70 italic">
                      Ditambahkan otomatis (FK dependency)
                    </span>
                  )}
                </div>
              </label>
            );
          })}
        </div>
      </div>

      <p className="text-[11px] text-text-muted leading-relaxed">
        Tabel yang dibutuhkan oleh foreign key akan ditambahkan secara otomatis
        sebagai dependensi (biru).
      </p>
    </div>
  );
}
