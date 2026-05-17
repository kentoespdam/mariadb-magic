/**
 * page.tsx (Connections)
 *
 * Halaman untuk konfigurasi koneksi database awal.
 */

"use client";

import { Button } from "@/components/ui/button";
import { ArrowLeftIcon } from "lucide-react";
import Link from "next/link";
import { DualConnectionForm } from "./_components/DualConnectionForm";

export default function ConnectionsPage() {
  return (
    <div className="mx-auto max-w-5xl px-6 py-8 space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/">
            <ArrowLeftIcon className="h-4 w-4" />
          </Link>
        </Button>
        <h1 className="text-2xl font-semibold">Konfigurasi Koneksi</h1>
      </div>

      <p className="text-sm text-text-muted">
        Siapkan koneksi ke database sumber (MariaDB lama) dan database tujuan
        (MariaDB baru/kosong).
      </p>

      <DualConnectionForm />
    </div>
  );
}
