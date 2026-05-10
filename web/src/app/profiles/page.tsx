"use client"

import { AppShell } from "@/components/AppShell"
import { PageHeader } from "@/components/PageHeader"
import { ProfileCard } from "@/components/profiles/ProfileCard"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { EmptyState } from "@/components/EmptyState"
import { Plus, Search } from "lucide-react"
import { useState } from "react"

const mockProfiles = [
  {
    id: "1",
    name: "Production to Local Sync",
    status: "ready" as const,
    source_name: "Source Production",
    dest_name: "Destination Local",
    selection_set: { tables: [{ table_name: "users" }, { table_name: "products" }] },
    created_at: "2026-05-05T10:00:00Z",
  },
  {
    id: "2",
    name: "Analytics Data Copy",
    status: "draft" as const,
    source_name: "Source Production",
    dest_name: "Analytics DB",
    selection_set: { tables: [{ table_name: "logs" }] },
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

        <div className="mb-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {profiles.length > 0 ? (
            profiles.map((profile) => (
              <ProfileCard key={profile.id} profile={profile} />
            ))
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
      </div>
    </AppShell>
  )
}