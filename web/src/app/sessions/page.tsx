"use client";

import { Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import useSWR from "swr";
import { sessionService } from "@/lib/services/sessions";
import { useSseSession } from "@/hooks/useSseSession";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ArrowLeftIcon, AlertCircleIcon, CheckCircle2Icon, Loader2Icon } from "lucide-react";
import Link from "next/link";
import { SyncSession } from "@/types/SyncSession";

function SessionDetailContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("id");
  const router = useRouter();

  const { data: session, error } = useSWR<SyncSession>(
    sessionId ? `/api/sessions/${sessionId}` : null,
    () => sessionService.get(sessionId!)
  );

  const { progress } = useSseSession(
    session?.status === "running" ? sessionId : null
  );

  if (!sessionId) {
    return (
      <div className="p-8 text-center">
        <p className="text-muted-foreground">ID Sesi tidak ditemukan.</p>
        <Button className="mt-4" asChild>
          <Link href="/">Kembali ke Dashboard</Link>
        </Button>
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

  const currentStatus = session.status === "running" ? progress.status : session.status;
  const processed = session.status === "running" ? progress.processed : session.rows_processed;
  const failed = session.status === "running" ? progress.failed : session.rows_failed;
  const currentTable = session.status === "running" ? progress.currentTable : session.current_table;

  const formatDate = (dateStr: string) => {
    return new Intl.DateTimeFormat("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(dateStr));
  };

  return (
    <div className="mx-auto max-w-4xl px-6 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/">
              <ArrowLeftIcon className="h-4 w-4" />
            </Link>
          </Button>
          <h1 className="text-2xl font-semibold">Detail Sesi Sinkronisasi</h1>
        </div>
        <div className="text-sm text-muted-foreground">
          ID: <code className="bg-muted px-1 rounded">{sessionId.slice(0, 8)}</code>
        </div>
      </div>

      <Card className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h2 className="text-lg font-medium capitalize">
              {currentStatus === "running" ? "Sedang Berjalan" : 
               currentStatus === "completed" || currentStatus === "done" ? "Selesai" : 
               currentStatus === "failed" ? "Gagal" : 
               currentStatus === "cancelled" ? "Dibatalkan" : "Menunggu"}
            </h2>
            <p className="text-sm text-muted-foreground">
              Mulai: {formatDate(session.started_at)}
            </p>
          </div>
          <StatusIcon status={currentStatus} />
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Progress: {processed} baris diproses</span>
            {failed > 0 && <span className="text-destructive font-medium">{failed} gagal</span>}
          </div>
          <Progress value={currentStatus === "running" ? undefined : 100} className="h-2" />
          {currentTable && (
            <p className="text-xs text-muted-foreground animate-pulse">
              Memproses tabel: <span className="font-mono">{currentTable}</span>
            </p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4 pt-4 border-t">
          <div>
            <div className="text-sm text-muted-foreground">Berhasil</div>
            <div className="text-2xl font-semibold text-green-600">{processed - failed}</div>
          </div>
          <div>
            <div className="text-sm text-muted-foreground">Gagal</div>
            <div className="text-2xl font-semibold text-destructive">{failed}</div>
          </div>
        </div>
      </Card>

      {failed > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Log Kegagalan</h3>
          <p className="text-sm text-muted-foreground">
            Daftar kegagalan baris akan muncul di sini. Untuk detail lengkap silakan ekspor CSV.
          </p>
          <Button variant="outline" asChild>
            <a href={`/api/sessions/${sessionId}/logs.csv`} download>
              Ekspor Log (CSV)
            </a>
          </Button>
        </div>
      )}

      <div className="flex justify-end gap-4 pt-4">
        <Button variant="outline" asChild>
          <Link href="/">Tutup</Link>
        </Button>
      </div>
    </div>
  );
}

function StatusIcon({ status }: { status: string }) {
  switch (status) {
    case "running":
      return <Loader2Icon className="h-6 w-6 animate-spin text-blue-500" />;
    case "completed":
    case "done":
      return <CheckCircle2Icon className="h-6 w-6 text-green-500" />;
    case "failed":
      return <AlertCircleIcon className="h-6 w-6 text-destructive" />;
    case "cancelled":
      return <AlertCircleIcon className="h-6 w-6 text-muted-foreground" />;
    default:
      return null;
  }
}

export default function SessionDetailPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center">Memuat...</div>}>
      <SessionDetailContent />
    </Suspense>
  );
}
