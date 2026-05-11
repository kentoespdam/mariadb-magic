"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeftIcon } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export default function NewProfilePage() {
  const [name, setName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    // TODO: integrate with profileService.create when backend ready
    console.log("create profile:", name);
    setIsSubmitting(false);
  };

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

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="profile-name">Nama Profile</Label>
          <Input
            id="profile-name"
            placeholder="My First Profile"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>

        <div className="rounded-md bg-muted p-4 text-sm text-muted-foreground">
          <p className="font-medium">Langkah berikutnya:</p>
          <ul className="mt-2 list-disc pl-4 space-y-1">
            <li>Pilih koneksi sumber dan tujuan</li>
            <li>Pilih tabel dan kolom yang akan disinkronkan</li>
            <li>Atur aturan transformasi data</li>
          </ul>
        </div>

        <div className="flex justify-end gap-4">
          <Button variant="outline" type="button" asChild>
            <Link href="/">Batal</Link>
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Menyimpan..." : "Buat Profile"}
          </Button>
        </div>
      </form>
    </div>
  );
}