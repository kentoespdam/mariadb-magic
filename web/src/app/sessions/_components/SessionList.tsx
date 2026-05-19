"use client";

import useSWR from "swr";
import { sessionService } from "@/lib/services/sessions";
import { SyncSession } from "@/types/SyncSession";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { SessionStatusBadge } from "./SessionStatusBadge";
import { Button } from "@/components/ui/button";
import { ArrowRightIcon, HistoryIcon } from "lucide-react";
import Link from "next/link";

export function SessionList() {
  const { data: sessions, error } = useSWR<SyncSession[]>(
    "/api/sessions/",
    () => sessionService.list()
  );

  if (error) {
    return (
      <Card className="p-8 text-center text-destructive">
        Gagal memuat daftar sesi.
      </Card>
    );
  }

  if (!sessions) {
    return (
      <Card className="p-8 text-center text-muted-foreground">
        Memuat daftar sesi...
      </Card>
    );
  }

  if (sessions.length === 0) {
    return (
      <Card className="p-12 text-center space-y-4">
        <div className="mx-auto w-12 h-12 rounded-full bg-muted flex items-center justify-center">
          <HistoryIcon className="h-6 w-6 text-muted-foreground" />
        </div>
        <div className="space-y-2">
          <h3 className="text-lg font-medium">Belum ada sesi sinkronisasi</h3>
          <p className="text-sm text-muted-foreground">
            Riwayat sinkronisasi Anda akan muncul di sini setelah Anda memulai sinkronisasi pertama.
          </p>
        </div>
        <Button asChild>
          <Link href="/sessions/new">Mulai Sinkronisasi</Link>
        </Button>
      </Card>
    );
  }

  const formatDate = (dateStr: string) => {
    return new Intl.DateTimeFormat("id-ID", {
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(dateStr));
  };

  return (
    <Card className="overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Waktu Mulai</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Progress</TableHead>
            <TableHead className="w-[100px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sessions.map((session) => (
            <TableRow key={session.id} className="group">
              <TableCell className="font-medium">
                {formatDate(session.started_at)}
              </TableCell>
              <TableCell>
                <SessionStatusBadge status={session.status} />
              </TableCell>
              <TableCell className="text-right">
                <div className="text-sm">
                  {session.rows_processed} baris
                  {session.rows_failed > 0 && (
                    <span className="text-destructive ml-1">
                      ({session.rows_failed} gagal)
                    </span>
                  )}
                </div>
              </TableCell>
              <TableCell>
                <Button variant="ghost" size="icon" asChild className="opacity-0 group-hover:opacity-100 transition-opacity">
                  <Link href={`/sessions?id=${session.id}`}>
                    <ArrowRightIcon className="h-4 w-4" />
                  </Link>
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  );
}
