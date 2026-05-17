/**
 * ValidationPanels.tsx
 *
 * Panel untuk menampilkan error validasi struktur (PK, NOT NULL)
 * dan collision antar profile (ADR-0007).
 */

import { AlertCircleIcon, TriangleAlertIcon } from "lucide-react";
import type { MarkReadyResponse } from "@/types/MappingProfile";

export function ValidationPanels({
  response,
}: {
  response: MarkReadyResponse | null;
}) {
  if (!response) return null;

  return (
    <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
      {/* Structural Validation Errors (400) */}
      {response.errors && response.errors.length > 0 && (
        <div className="rounded-lg border border-destructive bg-destructive/5 p-4 space-y-3">
          <div className="flex items-center gap-2 text-destructive">
            <AlertCircleIcon className="h-4 w-4" />
            <h4 className="font-semibold text-sm">
              Kesalahan Validasi Struktur
            </h4>
          </div>
          <ul className="list-disc list-inside text-xs space-y-1 text-destructive/90">
            {response.errors.map((err, i) => (
              <li key={`${err.Table}.${err.Column}-${i}`}>
                <span className="font-mono font-bold">
                  {err.Table}.{err.Column}:
                </span>{" "}
                {err.Message}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Collision Conflicts (409) */}
      {response.conflicts && response.conflicts.length > 0 && (
        <div className="rounded-lg border border-warning bg-warning/5 p-4 space-y-3">
          <div className="flex items-center gap-2 text-warning-foreground">
            <TriangleAlertIcon className="h-4 w-4" />
            <h4 className="font-semibold text-sm">
              Tabrakan Tabel Destination
            </h4>
          </div>
          <div className="space-y-2">
            <p className="text-xs text-warning-foreground/90 leading-relaxed">
              {response.error_friendly}
            </p>
            <p className="text-[10px] text-warning-foreground/60 italic">
              ADR-0007: Dua profile tidak boleh menulis ke tabel yang sama untuk
              menghindari inkonsistensi data.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
