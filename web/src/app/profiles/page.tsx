/**
 * page.tsx
 *
 * Halaman daftar Mapping Profiles.
 */

"use client";

import { ProfileListTable } from "./_components/ProfileListTable";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { PlusIcon } from "lucide-react";
import Link from "next/link";

export default function ProfilesPage() {
  return (
    <div className="mx-auto max-w-5xl px-6 py-8 space-y-8">
      <PageHeader
        title="Mapping Profiles"
        description="Kelola skema pemetaan dan aturan transformasi data antar database."
        actions={
          <Button asChild className="gap-2">
            <Link href="/profiles/new">
              <PlusIcon className="h-4 w-4" /> Profile Baru
            </Link>
          </Button>
        }
      />

      <ProfileListTable />
    </div>
  );
}
