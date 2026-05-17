/**
 * ProfileListTable.tsx
 *
 * Komponen tabel untuk menampilkan daftar Mapping Profiles.
 * Terintegrasi dengan StatusBadge dan link ke detail builder.
 */

"use client";

import useSWR from "swr";
import { profileService } from "@/lib/services/profiles";
import { LoadingBoundary } from "@/components/LoadingBoundary";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Link from "next/link";
import { Settings2Icon, PlusIcon } from "lucide-react";

export function ProfileListTable() {
  const { data: profiles, isLoading } = useSWR("/api/profiles/", () =>
    profileService.list(),
  );

  if (isLoading) {
    return <LoadingBoundary variant="list-skeleton" />;
  }

  if (!profiles || profiles.length === 0) {
    return (
      <div className="text-center py-16 bg-surface-subtle rounded-xl border border-dashed flex flex-col items-center gap-4">
        <p className="text-sm text-text-muted italic">Belum ada profile.</p>
        <Button asChild variant="outline">
          <Link href="/profiles/new">
            <PlusIcon className="mr-2 h-4 w-4" /> Buat Profile Baru
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="rounded-lg border bg-surface overflow-hidden">
      <Table>
        <TableHeader className="bg-muted/30">
          <TableRow>
            <TableHead className="px-4">Nama Profile</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Terakhir Diubah</TableHead>
            <TableHead className="text-right px-4">Aksi</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {profiles.map((p) => (
            <TableRow key={p.id} className="group transition-colors">
              <TableCell className="font-semibold px-4">{p.name}</TableCell>
              <TableCell>
                <StatusBadge type="profile" status={p.status} />
              </TableCell>
              <TableCell className="text-text-muted text-[11px] font-mono">
                {new Date(p.updated_at).toLocaleString("id-ID", {
                  dateStyle: "medium",
                  timeStyle: "short",
                })}
              </TableCell>
              <TableCell className="text-right px-4">
                <Button
                  variant="ghost"
                  size="sm"
                  asChild
                  className="h-8 text-xs gap-1.5 opacity-60 group-hover:opacity-100"
                >
                  <Link href={`/profiles/edit?id=${p.id}`}>
                    <Settings2Icon className="h-3.5 w-3.5" /> Konfigurasi
                  </Link>
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
