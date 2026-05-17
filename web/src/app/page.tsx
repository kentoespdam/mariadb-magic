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
  has_running_session: boolean;
  running_session_id?: string;
  sessions_count: number;
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
  const hasRunningSession = state?.has_running_session ?? false;
  const canSync = hasConnections && hasReadyProfile && !hasRunningSession;

  return (
    <div className="mx-auto max-w-5xl px-6 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Magic MariaDB Sync</h1>
        {state?.has_any_session && (
          <div className="text-sm text-muted-foreground">
            Total Sesi: {state.sessions_count}
          </div>
        )}
      </div>

      {hasRunningSession && state?.running_session_id && (
        <Card className="p-4 bg-blue-50 border-blue-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
            <p className="text-sm font-medium text-blue-900">Ada sesi sinkronisasi yang sedang berjalan.</p>
          </div>
          <Button size="sm" onClick={() => router.push(`/sessions?id=${state.running_session_id}`)}>
            Pantau Progress
          </Button>
        </Card>
      )}

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
          title={state?.has_any_session ? "Mulai Sinkronisasi" : "Mulai Sync Pertama"}
          desc="Jalankan sinkronisasi data antar MariaDB."
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
