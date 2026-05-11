"use client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowRightIcon } from "lucide-react";
import useSWR from "swr";

interface OnboardingState {
  hasConnections: boolean;
  hasReadyProfile: boolean;
  hasAnySession: boolean;
}

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export default function Dashboard() {
  const { data: state } = useSWR<OnboardingState>(
    "/api/onboarding/state",
    fetcher,
  );
  const hasConnections = state?.hasConnections ?? false;
  const hasReadyProfile = state?.hasReadyProfile ?? false;
  const hasAnySession = state?.hasAnySession ?? false;

  return (
    <div className="mx-auto max-w-5xl px-6 py-8 space-y-6">
      <h1 className="text-2xl font-semibold">Magic MariaDB Sync</h1>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card className="p-6 flex flex-col justify-between">
          <div>
            <h2 className="text-lg font-medium mb-2">Tambah Koneksi</h2>
            <p className="text-sm text-muted-foreground">
              Buat koneksi ke database sumber dan tujuan.
            </p>
          </div>
          <Button asChild className="mt-4 w-full">
            <a href="/connections">
              <ArrowRightIcon className="mr-2 h-4 w-4" />
              Tambah Koneksi
            </a>
          </Button>
        </Card>
        <Card
          className={`p-6 flex flex-col justify-between ${
            hasConnections ? "" : "opacity-50"
          }`}
          aria-disabled={!hasConnections}
        >
          <div>
            <h2 className="text-lg font-medium mb-2">Buat Mapping Profile</h2>
            <p className="text-sm text-muted-foreground">
              Pilih tabel, kolom, dan aturan transformasi.
            </p>
          </div>
          <Button asChild disabled={!hasConnections} className="mt-4 w-full">
            <a href="/profiles/new">
              <ArrowRightIcon className="mr-2 h-4 w-4" />
              Buat Mapping Profile
            </a>
          </Button>
        </Card>
        <Card
          className={`p-6 flex flex-col justify-between ${
            hasConnections && hasReadyProfile && !hasAnySession
              ? ""
              : "opacity-50"
          }`}
          aria-disabled={!(hasConnections && hasReadyProfile && !hasAnySession)}
        >
          <div>
            <h2 className="text-lg font-medium mb-2">Mulai Sync Pertama</h2>
            <p className="text-sm text-muted-foreground">
              Jalankan sinkronisasi data pertama.
            </p>
          </div>
          <Button
            asChild
            disabled={!(hasConnections && hasReadyProfile && !hasAnySession)}
            className="mt-4 w-full"
          >
            <a href="/sessions/new">
              <ArrowRightIcon className="mr-2 h-4 w-4" />
              Mulai Sync
            </a>
          </Button>
        </Card>
      </div>
    </div>
  );
}
