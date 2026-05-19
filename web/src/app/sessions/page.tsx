"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import useSWR from "swr";
import { sessionService } from "@/lib/services/sessions";
import { Loader2Icon } from "lucide-react";
import { SyncSession } from "@/types/SyncSession";
import { SessionDetail } from "./_components/SessionDetail";
import { SessionList } from "./_components/SessionList";

function SessionPageContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("id");

  const { data: session, error } = useSWR<SyncSession>(
    sessionId ? `/api/sessions/${sessionId}` : null,
    () => sessionService.get(sessionId!),
  );

  if (!sessionId) {
    return (
      <div className="mx-auto max-w-4xl px-6 py-8 space-y-6">
        <h1 className="text-2xl font-semibold">Riwayat Sinkronisasi</h1>
        <SessionList />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-center text-destructive">
        Gagal memuat detail sesi.
      </div>
    );
  }

  if (!session) {
    return (
      <div className="p-8 flex justify-center">
        <Loader2Icon className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-6 py-8">
      <SessionDetail session={session} sessionId={sessionId} />
    </div>
  );
}

export default function SessionsPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center">Memuat...</div>}>
      <SessionPageContent />
    </Suspense>
  );
}
