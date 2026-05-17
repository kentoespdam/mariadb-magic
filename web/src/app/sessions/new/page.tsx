"use client";

import { Button } from "@/components/ui/button";
import { ArrowLeftIcon } from "lucide-react";
import Link from "next/link";
import useSWR from "swr";
import { useSearchParams, useRouter } from "next/navigation";
import { Suspense, useState } from "react";
import { sessionService } from "@/lib/services/sessions";
import { toast } from "sonner";
import { MappingProfile } from "@/types/MappingProfile";

function NewSessionContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const profileId = searchParams.get("profile");
  const [isStarting, setIsStarting] = useState(false);

  // Fetch list of all profiles (since the current page uses it for Step 1 too)
  const { data: profiles } = useSWR<MappingProfile[]>("/api/profiles/", (url: string) =>
    fetch(url).then((r) => r.json())
  );
  const readyProfiles = profiles?.filter((p) => p.status === "ready") ?? [];

  const handleStartSession = async (id: string) => {
    try {
      setIsStarting(true);
      await sessionService.start(id);
      toast.success("Sinkronisasi berhasil dimulai");
      // Since there's no /sessions/[id], redirect to dashboard. 
      // The dashboard shows "has_any_session" status.
      router.push("/");
    } catch (e: any) {
      toast.error(e.message || "Gagal memulai sesi sinkronisasi");
    } finally {
      setIsStarting(false);
    }
  };

  if (profileId) {
    // Step 2: Konfirmasi
    const selectedProfile = readyProfiles.find((p) => p.id === profileId);

    return (
      <div className="mx-auto max-w-3xl px-6 py-8 space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/sessions/new">
              <ArrowLeftIcon className="h-4 w-4" />
            </Link>
          </Button>
          <h1 className="text-2xl font-semibold">Konfirmasi Sinkronisasi</h1>
        </div>

        <div className="rounded-md border p-6 space-y-6">
          <div className="space-y-2">
            <h2 className="text-lg font-medium">Anda akan memulai sinkronisasi:</h2>
            {selectedProfile ? (
              <div className="rounded bg-muted p-4 space-y-1">
                <div className="font-semibold">{selectedProfile.name}</div>
                <div className="text-sm text-muted-foreground">
                  Status: {selectedProfile.status}
                </div>
              </div>
            ) : profiles ? (
              <div className="text-destructive">Profil tidak ditemukan atau belum ready.</div>
            ) : (
              <div className="text-muted-foreground">Memuat profil...</div>
            )}
          </div>

          <p className="text-sm text-muted-foreground">
            Aksi ini akan menyalin data dari sumber ke tujuan berdasarkan pemetaan pada profil di atas. Data di tabel tujuan dengan ID yang sama akan ditimpa.
          </p>

          <div className="flex gap-4 pt-4">
            <Button
              onClick={() => handleStartSession(profileId)}
              disabled={!selectedProfile || isStarting}
            >
              {isStarting ? "Memulai..." : "Mulai Sinkronisasi"}
            </Button>
            <Button variant="outline" asChild disabled={isStarting}>
              <Link href="/sessions/new">Kembali</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Step 1: Pilih Profile
  return (
    <div className="mx-auto max-w-3xl px-6 py-8 space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/">
            <ArrowLeftIcon className="h-4 w-4" />
          </Link>
        </Button>
        <h1 className="text-2xl font-semibold">Mulai Sync Pertama</h1>
      </div>

      {profiles === undefined ? (
        <div className="text-muted-foreground">Memuat...</div>
      ) : readyProfiles.length === 0 ? (
        <div className="rounded-md bg-muted p-6 text-center">
          <p className="text-muted-foreground">
            Tidak ada profile yang ready. Buat dan aktifkan profile terlebih
            dahulu.
          </p>
          <Button className="mt-4" asChild>
            <Link href="/profiles/new">Buat Profile</Link>
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Pilih profile yang akan disinkronkan:
          </p>
          <div className="grid gap-4">
            {readyProfiles.map((profile) => (
              <Button key={profile.id} className="h-auto p-4 text-left" asChild>
                <Link href={`/sessions/new?profile=${profile.id}`}>
                  <div>
                    <div className="font-medium">{profile.name}</div>
                    <div className="text-sm text-muted-foreground">
                      Status: {profile.status}
                    </div>
                  </div>
                </Link>
              </Button>
            ))}
          </div>
        </div>
      )}

      <div className="flex justify-end gap-4 pt-4">
        <Button variant="outline" asChild>
          <Link href="/">Batal</Link>
        </Button>
      </div>
    </div>
  );
}

export default function NewSessionPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-3xl px-6 py-8 text-muted-foreground">
          Memuat...
        </div>
      }
    >
      <NewSessionContent />
    </Suspense>
  );
}
