"use client"

import { useState } from "react"
import { AppShell } from "@/components/AppShell"
import { PageHeader } from "@/components/PageHeader"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { StatusBadge } from "@/components/StatusBadge"
import { Plus, Search } from "lucide-react"

const mockConnections = [
  {
    id: "1",
    name: "Source Production",
    host: "192.168.1.100",
    port: 3306,
    username: "app_user",
    database: "production_db",
    last_test_status: "ok" as const,
    last_test_at: "2026-05-10T10:00:00Z",
    created_at: "2026-05-01T08:00:00Z",
  },
  {
    id: "2",
    name: "Destination Local",
    host: "localhost",
    port: 3306,
    username: "root",
    database: "local_db",
    last_test_status: "ok" as const,
    last_test_at: "2026-05-10T09:30:00Z",
    created_at: "2026-05-01T08:15:00Z",
  },
]

export default function ConnectionsPage() {
  const [search, setSearch] = useState("")
  const connections = mockConnections.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.host.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <AppShell>
      <div className="page-container py-6">
        <PageHeader
          title="Koneksi"
          description="Kelola koneksi Source dan Destination MariaDB"
          actions={
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Tambah Koneksi
            </Button>
          }
        />

        <div className="mb-4 flex gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
            <Input
              placeholder="Cari koneksi..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nama</TableHead>
              <TableHead>Host</TableHead>
              <TableHead>Database</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Terakhir Tes</TableHead>
              <TableHead>Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {connections.map((conn) => (
              <TableRow key={conn.id}>
                <TableCell className="font-medium text-text">{conn.name}</TableCell>
                <TableCell className="font-mono text-[13px]">
                  {conn.host}:{conn.port}
                </TableCell>
                <TableCell className="font-mono text-[13px]">{conn.database}</TableCell>
                <TableCell>
                  <StatusBadge status={conn.last_test_status} type="connection" />
                </TableCell>
                <TableCell className="text-small text-text-muted">
                  {conn.last_test_at
                    ? new Date(conn.last_test_at).toLocaleString("id-ID")
                    : "-"}
                </TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="sm">Edit</Button>
                    <Button variant="ghost" size="sm">Test</Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {connections.length === 0 && (
          <div className="mt-8 text-center text-text-muted">
            Tidak ada koneksi yang cocok dengan pencarian
          </div>
        )}
      </div>
    </AppShell>
  )
}