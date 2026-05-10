"use client"

import { useState } from "react"
import { AppShell } from "@/components/AppShell"
import { PageHeader } from "@/components/PageHeader"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { StatusBadge } from "@/components/StatusBadge"
import { EmptyState } from "@/components/EmptyState"
import { Plus, Search } from "lucide-react"

const mockProfiles = [
  {
    id: "1",
    name: "Production to Local Sync",
    status: "ready" as const,
    source_name: "Source Production",
    dest_name: "Destination Local",
    tables_count: 12,
    created_at: "2026-05-05T10:00:00Z",
  },
  {
    id: "2",
    name: "Analytics Data Copy",
    status: "draft" as const,
    source_name: "Source Production",
    dest_name: "Analytics DB",
    tables_count: 5,
    created_at: "2026-05-08T14:30:00Z",
  },
]

export default function ProfilesPage() {
  const [search, setSearch] = useState("")
  const profiles = mockProfiles.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.source_name.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <AppShell>
      <div className="page-container py-6">
        <PageHeader
          title="Mapping Profile"
          description="Buat dan kelola profile pemetaan tabel dan kolom"
          actions={
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Profile Baru
            </Button>
          }
        />

        <div className="mb-4 flex gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
            <Input
              placeholder="Cari profile..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        {profiles.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nama</TableHead>
                <TableHead>Source</TableHead>
                <TableHead>Destination</TableHead>
                <TableHead>Tabel</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {profiles.map((profile) => (
                <TableRow key={profile.id}>
                  <TableCell className="font-medium text-text">{profile.name}</TableCell>
                  <TableCell className="text-small text-text-secondary">{profile.source_name}</TableCell>
                  <TableCell className="text-small text-text-secondary">{profile.dest_name}</TableCell>
                  <TableCell className="font-mono text-[13px]">{profile.tables_count}</TableCell>
                  <TableCell>
                    <StatusBadge status={profile.status} type="profile" />
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm">Edit</Button>
                      <Button variant="ghost" size="sm">Sync</Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <EmptyState
            icon="profile"
            title="Belum ada Mapping Profile"
            description="Buat profile baru untuk mulai menyinkronkan data antar MariaDB"
            action={{
              label: "Buat Profile Baru",
              href: "/profiles/new",
            }}
          />
        )}
      </div>
    </AppShell>
  )
}