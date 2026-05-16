"use client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowRightIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import useSWR from "swr";

// BE serialize snake_case (lihat internal/api/onboarding.go:OnboardingState).
interface OnboardingState {
  has_connections: boolean;
  has_ready_profile: boolean;
  has_any_session: boolean;
}

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export default function Dashboard() {
  const router = useRouter();
  const { data: state } = useSWR<OnboardingState>(
    "/api/onboarding/state",
    fetcher,
  );
  const hasConnections = state?.has_connections ?? false;
  const hasReadyProfile = state?.has_ready_profile ?? false;
  const hasAnySession = state?.has_any_session ?? false;
  const canSync = hasConnections && hasReadyProfile && !hasAnySession;

  return (
    <div className="mx-auto max-w-5xl px-6 py-8 space-y-6">
      <h1 className="text-2xl font-semibold">Magic MariaDB Sync</h1>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <DashCard
          title="Tambah Koneksi"
          desc="Buat koneksi ke database sumber dan tujuan."
          label="Tambah Koneksi"
          onClick={() => router.push("/connections")}
        />
        <DashCard
          title="Mapping Profiles"
          desc="Pilih tabel, kolom, dan aturan transformasi."
          label="Kelola Profile"
          disabled={!hasConnections}
          onClick={() => router.push("/profiles")}
        />
        <DashCard
          title="Mulai Sync Pertama"
          desc="Jalankan sinkronisasi data pertama."
          label="Mulai Sync"
          disabled={!canSync}
          onClick={() => router.push("/sessions/new")}
        />
      </div>
    </div>
  );
}

function DashCard(props: {
  title: string;
  desc: string;
  label: string;
  disabled?: boolean;
  onClick: () => void;
}) {
  return (
    <Card
      className={`p-6 flex flex-col justify-between ${props.disabled ? "opacity-50" : ""}`}
      aria-disabled={props.disabled}
    >
      <div>
        <h2 className="text-lg font-medium mb-2">{props.title}</h2>
        <p className="text-sm text-muted-foreground">{props.desc}</p>
      </div>
      <Button
        type="button"
        disabled={props.disabled}
        onClick={props.onClick}
        className="mt-4 w-full"
      >
        <ArrowRightIcon className="mr-2 h-4 w-4" />
        {props.label}
      </Button>
    </Card>
  );
}
