"use client";

import { RefreshCw } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { PageHeader } from "@/components/PageHeader";
import { SessionDetail } from "@/components/sessions/SessionDetail";
import { Button } from "@/components/ui/button";

const mockSessions = [
  {
    id: "1",
    profile_id: "1",
    profile_name: "Production to Local Sync",
    status: "done" as const,
    started_at: "2026-05-10T09:00:00Z",
    finished_at: "2026-05-10T09:15:30Z",
    total_rows: 15000,
    processed_rows: 15000,
    failed_rows: 0,
    tables: [
      {
        table_name: "users",
        total_rows: 5000,
        processed_rows: 5000,
        failed_rows: 0,
        status: "done" as const,
      },
      {
        table_name: "products",
        total_rows: 10000,
        processed_rows: 10000,
        failed_rows: 0,
        status: "done" as const,
      },
    ],
  },
  {
    id: "2",
    profile_id: "2",
    profile_name: "Analytics Data Copy",
    status: "running" as const,
    started_at: "2026-05-10T11:30:00Z",
    total_rows: 25000,
    processed_rows: 12500,
    failed_rows: 0,
    tables: [
      {
        table_name: "logs",
        total_rows: 25000,
        processed_rows: 12500,
        failed_rows: 0,
        status: "running" as const,
      },
    ],
  },
];

export default function SessionsPage() {
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

        <div className="mt-6 space-y-6">
          {mockSessions.map((session) => (
            <SessionDetail key={session.id} session={session} />
          ))}
        </div>
      </div>
    </AppShell>
  );
}
