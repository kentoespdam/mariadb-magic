"use client";

import { useState } from "react";
import useSWR from "swr";
import { profileService } from "@/lib/services/profiles";
import { ProfileHeader } from "./_components/ProfileHeader";
import { TablePicker } from "./_components/TablePicker";
import { PairingEditor } from "./_components/PairingEditor";
import { ValidationPanels } from "./_components/ValidationPanels";
import { PreflightPanel } from "./_components/PreflightPanel";
import { LoadingBoundary } from "@/components/LoadingBoundary";
import { EmptyState } from "@/components/EmptyState";
import { FileQuestionIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import type { MarkReadyResponse } from "@/types/MappingProfile";

export default function ProfileDetailClient({ id }: { id: string }) {
  const [selectedTable, setSelectedTable] = useState<string | null>(null);
  const [markReadyResp, setMarkReadyResp] = useState<MarkReadyResponse | null>(
    null,
  );

  const {
    data: profile,
    error: profileError,
    isLoading: profileLoading,
  } = useSWR(id ? `/api/profiles/${id}` : null, () => profileService.get(id));

  const {
    data: schema,
    error: schemaError,
    isLoading: schemaLoading,
  } = useSWR(id ? `/api/profiles/${id}/schema` : null, () =>
    profileService.getSchema(id),
  );

  const isLoading = profileLoading || schemaLoading;
  const error = profileError || schemaError;

  if (isLoading) {
    return (
      <div className="mx-auto max-w-5xl px-6 py-8">
        <LoadingBoundary variant="two-pane-split" />
      </div>
    );
  }

  if (error || !profile || !schema) {
    return (
      <div className="mx-auto max-w-5xl px-6 py-8">
        <EmptyState
          title="Profil Tidak Ditemukan"
          description="Profil yang Anda cari tidak ada atau telah dihapus."
          icon={FileQuestionIcon}
          action={{
            label: "Kembali ke Beranda",
            href: "/",
          }}
        />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-6 py-8 space-y-8">
      <ProfileHeader profile={profile} onMarkReadyResponse={setMarkReadyResp} />

      <div className="grid gap-8 md:grid-cols-[300px_1fr]">
        <aside className="space-y-8">
          <TablePicker profileId={id} schema={schema} />

          <div className="space-y-3">
            <h3 className="text-sm font-medium text-text-secondary uppercase tracking-wider">
              Konfigurasi Tabel
            </h3>
            <div className="space-y-1">
              {schema.tables.map((t) => (
                <button
                  key={t.name}
                  type="button"
                  onClick={() => setSelectedTable(t.name)}
                  className={cn(
                    "w-full text-left px-3 py-2 rounded-md text-sm transition-colors",
                    selectedTable === t.name
                      ? "bg-primary text-primary-foreground font-medium"
                      : "hover:bg-muted text-text-muted hover:text-text",
                  )}
                >
                  {t.name}
                </button>
              ))}
              {schema.tables.length === 0 && (
                <p className="text-xs text-text-muted italic px-3">
                  Pilih tabel di atas untuk mulai konfigurasi.
                </p>
              )}
            </div>
          </div>
        </aside>

        <main className="space-y-6">
          <ValidationPanels response={markReadyResp} />

          {selectedTable ? (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold tracking-tight">
                Konfigurasi: {selectedTable}
              </h2>
              <PairingEditor
                profile={profile}
                schema={schema}
                tableName={selectedTable}
              />
            </div>
          ) : (
            <div className="space-y-8">
              <PreflightPanel profileId={id} />

              {schema.tables.length === 0 && (
                <div className="rounded-lg border border-dashed p-24 bg-muted/30 flex items-center justify-center text-center h-[300px]">
                  <p className="text-sm text-muted-foreground italic">
                    Pilih tabel di sidebar untuk mulai sinkronisasi.
                  </p>
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
