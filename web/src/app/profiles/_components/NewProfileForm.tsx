"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useConnections } from "@/hooks/useConnections";
import { profileService } from "@/lib/services/profiles";
import { mutate } from "swr";
import { ConnPicker } from "./ConnPicker";

// Form buat profile draft: nama + pilih koneksi sumber/tujuan.
// Tabel + kolom dipilih nanti di editor pairing (issue tersendiri).
export function NewProfileForm() {
  const router = useRouter();
  const { data: connections, isLoading } = useConnections();
  const [name, setName] = useState("");
  const [sourceID, setSourceID] = useState("");
  const [destID, setDestID] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const sameConn = !!(sourceID && destID && sourceID === destID);
  const noConn = !isLoading && (connections?.length ?? 0) < 2;
  const canSubmit = Boolean(
    name.trim() && sourceID && destID && !sameConn && !submitting,
  );

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;
    setSubmitting(true);
    setErr(null);
    try {
      await profileService.create({
        name: name.trim(),
        source_connection_id: sourceID,
        destination_connection_id: destID,
        tables: [],
      });
      await mutate("profiles/list");
      // Detail/editor route belum tersedia (issue lanjutan).
      // Kembali ke dashboard supaya user lihat profile draft barunya di daftar.
      router.push("/");
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : "Gagal membuat profile");
      setSubmitting(false);
    }
  }

  return (
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
      <div className="grid gap-4 sm:grid-cols-2">
        <ConnPicker
          label="Koneksi Sumber"
          value={sourceID}
          onChange={setSourceID}
          options={connections ?? []}
          loading={isLoading}
        />
        <ConnPicker
          label="Koneksi Tujuan"
          value={destID}
          onChange={setDestID}
          options={connections ?? []}
          loading={isLoading}
        />
      </div>
      {noConn && (
        <p className="text-sm text-destructive">
          Minimal 2 koneksi diperlukan. Tambahkan koneksi dulu di halaman
          Koneksi.
        </p>
      )}
      {sameConn && (
        <p className="text-sm text-destructive">
          Sumber dan tujuan tidak boleh sama.
        </p>
      )}
      {!canSubmit && !noConn && !sameConn && !submitting && (
        <p className="text-sm text-muted-foreground">
          Isi nama profile dan pilih kedua koneksi untuk melanjutkan.
        </p>
      )}
      {err && <p className="text-sm text-destructive">{err}</p>}
      <div className="flex justify-end gap-4">
        <Button variant="outline" type="button" onClick={() => router.push("/")}>
          Batal
        </Button>
        <Button type="submit" disabled={!canSubmit}>
          {submitting ? "Menyimpan..." : "Buat Profile"}
        </Button>
      </div>
    </form>
  );
}

