/**
 * ProfileHeader.tsx
 *
 * Header untuk halaman detail profil. Menampilkan nama, status,
 * dan tombol kembali.
 */

"use client";

import { Button } from "@/components/ui/button";
import { ArrowLeftIcon } from "lucide-react";
import Link from "next/link";
import { StatusBadge } from "@/components/StatusBadge";
import type { MappingProfile, MarkReadyResponse } from "@/types/MappingProfile";
import { MarkReadyButton } from "./MarkReadyButton";

interface ProfileHeaderProps {
  profile: MappingProfile;
  onMarkReadyResponse: (resp: MarkReadyResponse | null) => void;
}

export function ProfileHeader({
  profile,
  onMarkReadyResponse,
}: ProfileHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/">
            <ArrowLeftIcon className="h-4 w-4" />
          </Link>
        </Button>
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-semibold tracking-tight">
            {profile.name}
          </h1>
          <StatusBadge type="profile" status={profile.status} />
        </div>
      </div>

      <div className="flex items-center gap-3">
        <MarkReadyButton profile={profile} onResponse={onMarkReadyResponse} />
      </div>
    </div>
  );
}
