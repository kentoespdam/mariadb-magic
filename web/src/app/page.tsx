"use client";

import { Database, GitBranch, PlayCircle } from "lucide-react";
import Link from "next/link";
import { AppShell } from "@/components/AppShell";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

function OnboardingCard({
  icon: Icon,
  title,
  description,
  href,
  locked = false,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  href: string;
  locked?: boolean;
}) {
  return (
    <Card className={locked ? "opacity-50" : ""}>
      <CardHeader className="flex flex-row items-center gap-3 pb-2">
        <div className="rounded bg-primary/10 p-2">
          <Icon className="h-5 w-5 text-primary" />
        </div>
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <CardDescription>{description}</CardDescription>
        {locked ? (
          <p className="mt-3 text-caption text-text-muted">Selesaikan langkah sebelumnya dulu</p>
        ) : (
          <Link href={href} className="mt-3 inline-block">
            <span className="text-caption text-primary hover:underline">Mulai →</span>
          </Link>
        )}
      </CardContent>
    </Card>
  );
}

export default function DashboardPage() {
  const hasConnections = true;
  const hasReadyProfile = true;
  const hasAnySession = false;

  return (
    <AppShell>
      <div className="page-container py-6">
        <h1 className="text-h1 mb-6">Dashboard</h1>

        {!hasAnySession ? (
          <div className="grid gap-6 md:grid-cols-3">
            <OnboardingCard
              icon={Database}
              title="Tambahkan Koneksi"
              description="Definisikan koneksi Source dan Destination MariaDB untuk memulai"
              href="/connections"
            />
            <OnboardingCard
              icon={GitBranch}
              title="Buat Mapping Profile"
              description="Pilih tabel dan kolom yang ingin disinkronkan antar database"
              href="/profiles"
              locked={!hasConnections}
            />
            <OnboardingCard
              icon={PlayCircle}
              title="Mulai Sync Pertama"
              description="Jalankan sinkronisasi data dengan profile yang sudah siap"
              href="/sessions"
              locked={!hasReadyProfile}
            />
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-3">
            <Link href="/connections">
              <Card className="h-full transition-colors hover:bg-surface-subtle">
                <CardHeader className="flex flex-row items-center gap-3 pb-2">
                  <div className="rounded bg-primary/10 p-2">
                    <Database className="h-5 w-5 text-primary" />
                  </div>
                  <CardTitle className="text-base">Koneksi</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>Kelola koneksi Source dan Destination MariaDB</CardDescription>
                </CardContent>
              </Card>
            </Link>

            <Link href="/profiles">
              <Card className="h-full transition-colors hover:bg-surface-subtle">
                <CardHeader className="flex flex-row items-center gap-3 pb-2">
                  <div className="rounded bg-primary/10 p-2">
                    <GitBranch className="h-5 w-5 text-primary" />
                  </div>
                  <CardTitle className="text-base">Mapping Profile</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    Buat dan kelola profile pemetaan tabel dan kolom
                  </CardDescription>
                </CardContent>
              </Card>
            </Link>

            <Link href="/sessions">
              <Card className="h-full transition-colors hover:bg-surface-subtle">
                <CardHeader className="flex flex-row items-center gap-3 pb-2">
                  <div className="rounded bg-primary/10 p-2">
                    <PlayCircle className="h-5 w-5 text-primary" />
                  </div>
                  <CardTitle className="text-base">Sync Sessions</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>Pantau progress dan log sinkronisasi data</CardDescription>
                </CardContent>
              </Card>
            </Link>
          </div>
        )}
      </div>
    </AppShell>
  );
}
