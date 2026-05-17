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

  // Fetch list of all profiles
  const { data: profiles } = useSWR<MappingProfile[]>("/api/profiles/", (url: string) =>
    fetch(url).then((r) => r.json())
  );
  
  // Fetch list of connections to resolve names
  const { data: connections } = useSWR<any[]>("/api/connections/", (url: string) =>
    fetch(url).then((r) => r.json())
  );

  const readyProfiles = profiles?.filter((p) => p.status === "ready") ?? [];

  const handleStartSession = async (id: string) => {
    try {
      setIsStarting(true);
      const res = await sessionService.start(id);
      toast.success("Sinkronisasi berhasil dimulai");
      // Navigate to the newly created session
      router.push(`/sessions/${res.id}`);
    } catch (e: any) {
      toast.error(e.message || "Gagal memulai sesi sinkronisasi");
    } finally {
      setIsStarting(false);
    }
  };

  if (profileId) {
    // Step 2: Konfirmasi
    const selectedProfile = readyProfiles.find((p) => p.id === profileId);
    
    // Resolve connection names
    const srcConn = connections?.find(c => c.id === selectedProfile?.source_connection_id);
    const dstConn = connections?.find(c => c.id === selectedProfile?.destination_connection_id);

    // Resolve table list
    let tables: string[] = [];
    if (selectedProfile?.selection_json) {
      if (typeof selectedProfile.selection_json === "string") {
        try {
          const parsed = JSON.parse(selectedProfile.selection_json);
          tables = parsed.tables || [];
        } catch (e) {}
      } else {
        tables = selectedProfile.selection_json.tables || [];
      }
    }

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
          <div className="space-y-4">
            <h2 className="text-lg font-medium">Detail Rencana Sinkronisasi</h2>
            
            {!selectedProfile && profiles ? (
               <div className="text-destructive">Profil tidak ditemukan atau belum ready.</div>
            ) : !selectedProfile || !connections ? (
               <div className="text-muted-foreground">Memuat detail profil...</div>
            ) : (
              <div className="grid gap-4">
                <div className="grid grid-cols-3 gap-4 py-2 border-b">
                  <div className="text-sm font-medium text-muted-foreground">Nama Profil</div>
                  <div className="col-span-2 font-medium">{selectedProfile.name}</div>
                </div>
                
                <div className="grid grid-cols-3 gap-4 py-2 border-b">
                  <div className="text-sm font-medium text-muted-foreground">Sumber</div>
                  <div className="col-span-2">
                    <div className="font-medium">{srcConn?.name || selectedProfile.source_connection_id}</div>
                    <div className="text-xs text-muted-foreground">{srcConn?.host}:{srcConn?.port} / {srcConn?.database}</div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 py-2 border-b">
                  <div className="text-sm font-medium text-muted-foreground">Tujuan</div>
                  <div className="col-span-2">
                    <div className="font-medium">{dstConn?.name || selectedProfile.destination_connection_id}</div>
                    <div className="text-xs text-muted-foreground">{dstConn?.host}:{dstConn?.port} / {dstConn?.database}</div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 py-2">
                  <div className="text-sm font-medium text-muted-foreground">Tabel</div>
                  <div className="col-span-2">
                    <div className="flex flex-wrap gap-1">
                      {tables.length > 0 ? tables.map(t => (
                        <span key={t} className="inline-flex items-center rounded-full bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10">
                          {t}
                        </span>
                      )) : <span className="text-sm text-muted-foreground">Tidak ada tabel dipilih</span>}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded p-4">
            <p className="text-sm text-amber-800">
              <strong>Peringatan:</strong> Data di tabel tujuan dengan ID yang sama akan ditimpa. Aksi ini tidak dapat dibatalkan setelah dimulai.
            </p>
          </div>

          <div className="flex gap-4 pt-4">
            <Button
              onClick={() => handleStartSession(profileId)}
              disabled={!selectedProfile || isStarting}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isStarting ? "Memulai..." : "Mulai Sinkronisasi"}
            </Button>
            <Button variant="outline" asChild disabled={isStarting}>
              <Link href="/sessions/new">Batal</Link>
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
