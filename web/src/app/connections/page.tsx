/**
 * page.tsx (Connections)
 *
 * Halaman untuk konfigurasi dan manajemen koneksi database.
 */

"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeftIcon, PlusIcon } from "lucide-react";
import Link from "next/link";
import { useConnections } from "@/hooks/useConnections";
import { LoadingBoundary } from "@/components/LoadingBoundary";
import { DualConnectionForm } from "./_components/DualConnectionForm";
import { ConnectionListTable } from "./_components/ConnectionListTable";
import { AddConnectionDialog } from "./_components/AddConnectionDialog";

export default function ConnectionsPage() {
  const { data: connections, isLoading, mutate } = useConnections();
  const [isAdding, setIsAdding] = useState(false);

  if (isLoading) {
    return (
      <div className="mx-auto max-w-5xl px-6 py-8">
        <LoadingBoundary variant="list-skeleton" />
      </div>
    );
  }

  const hasConnections = connections && connections.length > 0;

  return (
    <div className="mx-auto max-w-5xl px-6 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/">
              <ArrowLeftIcon className="h-4 w-4" />
            </Link>
          </Button>
          <h1 className="text-2xl font-semibold">
            {hasConnections ? "Manajemen Koneksi" : "Konfigurasi Koneksi"}
          </h1>
        </div>

        {hasConnections && (
          <Button onClick={() => setIsAdding(true)} className="gap-2">
            <PlusIcon className="h-4 w-4" /> Tambah Koneksi
          </Button>
        )}
      </div>

      <p className="text-sm text-text-muted">
        {hasConnections
          ? "Kelola daftar koneksi MariaDB yang tersimpan untuk digunakan dalam Mapping Profile."
          : "Siapkan koneksi ke database sumber (MariaDB lama) dan database tujuan (MariaDB baru/kosong)."}
      </p>

      {hasConnections ? <ConnectionListTable /> : <DualConnectionForm />}

      <AddConnectionDialog
        open={isAdding}
        onOpenChange={setIsAdding}
        onCreated={() => mutate()}
      />
    </div>
  );
}
