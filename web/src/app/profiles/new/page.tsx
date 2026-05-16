"use client";

import { Button } from "@/components/ui/button";
import { ArrowLeftIcon } from "lucide-react";
import Link from "next/link";
import { NewProfileForm } from "@/forms/NewProfileForm";

export default function NewProfilePage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-8 space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/">
            <ArrowLeftIcon className="h-4 w-4" />
          </Link>
        </Button>
        <h1 className="text-2xl font-semibold">Buat Mapping Profile</h1>
      </div>
      <NewProfileForm />
      <p className="text-sm text-muted-foreground">
        Setelah dibuat, lanjutkan ke editor untuk memilih tabel & aturan mapping
        sebelum profile bisa diaktifkan.
      </p>
    </div>
  );
}
