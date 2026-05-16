"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useConnections } from "@/hooks/useConnections";
import { profileService } from "@/lib/services/profiles";
import { mutate } from "swr";

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

  const sameConn = sourceID && destID && sourceID === destID;
  const canSubmit =
    name.trim() && sourceID && destID && !sameConn && !submitting;

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
      {sameConn && (
        <p className="text-sm text-destructive">
          Sumber dan tujuan tidak boleh sama.
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

function ConnPicker(props: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { id: string; name: string }[];
  loading: boolean;
}) {
  return (
    <div className="space-y-2">
      <Label>{props.label}</Label>
      <Select value={props.value} onValueChange={props.onChange}>
        <SelectTrigger>
          <SelectValue
            placeholder={props.loading ? "Memuat..." : "Pilih koneksi"}
          />
        </SelectTrigger>
        <SelectContent>
          {props.options.map((c) => (
            <SelectItem key={c.id} value={c.id}>
              {c.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
