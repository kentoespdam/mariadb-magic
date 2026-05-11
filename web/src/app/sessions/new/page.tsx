"use client";

import { Button } from "@/components/ui/button";
import { ArrowLeftIcon } from "lucide-react";
import Link from "next/link";
import useSWR from "swr";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

interface Profile {
  id: string;
  name: string;
  status: string;
}

export default function NewSessionPage() {
  const { data: profiles } = useSWR<Profile[]>("/api/profiles/", fetcher);
  const readyProfiles = profiles?.filter((p) => p.status === "ready") ?? [];

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

      {readyProfiles.length === 0 ? (
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

      <div className="flex justify-end gap-4">
        <Button variant="outline" asChild>
          <Link href="/">Batal</Link>
        </Button>
      </div>
    </div>
  );
}