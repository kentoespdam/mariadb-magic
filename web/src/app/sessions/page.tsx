"use client"

import { useState } from "react"
import { AppShell } from "@/components/AppShell"
import { PageHeader } from "@/components/PageHeader"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { StatusBadge } from "@/components/StatusBadge"
import { EmptyState } from "@/components/EmptyState"
import { Search, RefreshCw } from "lucide-react"
import { SyncSession } from "@/types/SyncSession"

const mockSessions: SyncSession[] = [
  {
    id: "1",
    profile_id: "1",
    profile_name: "Production to Local Sync",
    status: "done",
    started_at: "2026-05-10T09:00:00Z",
    finished_at: "2026-05-10T09:15:30Z",
    total_rows: 15000,
    processed_rows: 15000,
    failed_rows: 0,
    tables: [],
  },
  {
    id: "2",
    profile_id: "2",
    profile_name: "Analytics Data Copy",
    status: "failed",
    started_at: "2026-05-09T14:00:00Z",
    finished_at: "2026-05-09T14:05:00Z",
    total_rows: 5000,
    processed_rows: 3200,
    failed_rows: 18,
    error_message: "Referensi data tidak ditemukan pada tabel orders",
    tables: [],
  },
  {
    id: "3",
    profile_id: "1",
    profile_name: "Production to Local Sync",
    status: "running",
    started_at: "2026-05-10T11:30:00Z",
    total_rows: 25000,
    processed_rows: 12500,
    failed_rows: 0,
    tables: [],
  },
]

function formatRelativeTime(dateStr: string): string {
  const date = new Date(dateStr)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
  
  if (diffHours < 1) return "Baru saja"
  if (diffHours < 24) return `${diffHours} jam lalu`
  const diffDays = Math.floor(diffHours / 24)
  if (diffDays < 7) return `${diffDays} hari lalu`
  return date.toLocaleDateString("id-ID")
}

export default function SessionsPage() {
  const [search, setSearch] = useState("")
  const sessions = mockSessions.filter(
    (s) =>
      s.profile_name.toLowerCase().includes(search.toLowerCase()) ||
      s.status.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <AppShell>
      <div className="page-container py-6">
        <PageHeader
          title="Sync Sessions"
          description="Pantau progress dan log sinkronisasi data"
          actions={
            <Button variant="secondary">
              <RefreshCw className="mr-2 h-4 w-4" />
              Perbarui
            </Button>
          }
        />

        <div className="mb-4 flex gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
            <Input
              placeholder="Cari session..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        {sessions.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Profile</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Progress</TableHead>
                <TableHead>Gagal</TableHead>
                <TableHead>Mulai</TableHead>
                <TableHead>Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sessions.map((session) => (
                <TableRow key={session.id}>
                  <TableCell className="font-medium text-text">{session.profile_name}</TableCell>
                  <TableCell>
                    <StatusBadge status={session.status} type="session" />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-24 overflow-hidden rounded bg-muted">
                        <div
                          className="h-full bg-primary transition-all"
                          style={{
                            width: `${(session.processed_rows / session.total_rows) * 100}%`,
                          }}
                        />
                      </div>
                      <span className="text-small font-mono text-text-muted">
                        {session.processed_rows}/{session.total_rows}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="font-mono text-[13px]">
                    {session.failed_rows > 0 ? (
                      <span className="text-error">{session.failed_rows}</span>
                    ) : (
                      <span className="text-text-muted">0</span>
                    )}
                  </TableCell>
                  <TableCell className="text-small text-text-muted">
                    <div>{formatRelativeTime(session.started_at)}</div>
                    <div className="font-mono text-[12px]">
                      {new Date(session.started_at).toLocaleTimeString("id-ID")}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm">Detail</Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <EmptyState
            icon="session"
            title="Belum ada Sync Session"
            description="Mulai sync pertama dengan memilih Mapping Profile yang siap"
            action={{
              label: "Mulai Sync",
              href: "/profiles",
            }}
          />
        )}
      </div>
    </AppShell>
  )
}