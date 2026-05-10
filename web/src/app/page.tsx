import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Database, GitBranch, PlayCircle } from "lucide-react";
import Link from "next/link";

export default function DashboardPage() {
  return (
    <main className="mx-auto max-w-5xl px-6 py-8">
      <h1 className="mb-8 text-2xl font-semibold text-text">Magic MariaDB Sync</h1>
      
      <div className="grid gap-6 md:grid-cols-3">
        <Link href="/connections" className="block">
          <Card className="transition-colors hover:bg-surface-subtle">
            <CardHeader className="flex flex-row items-center gap-3 pb-2">
              <div className="rounded bg-primary/10 p-2">
                <Database className="h-5 w-5 text-primary" />
              </div>
              <CardTitle className="text-base">Koneksi</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Kelola koneksi Source dan Destination MariaDB
              </CardDescription>
            </CardContent>
          </Card>
        </Link>

        <Link href="/profiles" className="block">
          <Card className="transition-colors hover:bg-surface-subtle">
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

        <Link href="/sessions" className="block">
          <Card className="transition-colors hover:bg-surface-subtle">
            <CardHeader className="flex flex-row items-center gap-3 pb-2">
              <div className="rounded bg-primary/10 p-2">
                <PlayCircle className="h-5 w-5 text-primary" />
              </div>
              <CardTitle className="text-base">Sync Sessions</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Pantau progress dan log sinkronisasi data
              </CardDescription>
            </CardContent>
          </Card>
        </Link>
      </div>

      <div className="mt-8">
        <Link href="/settings">
          <Card className="transition-colors hover:bg-surface-subtle">
            <CardContent className="flex items-center gap-3 py-4">
              <span className="text-sm text-text-secondary">Konfigurasi dan pengaturan aplikasi</span>
            </CardContent>
          </Card>
        </Link>
      </div>
    </main>
  );
}