"use client";

import { GitBranch, Pencil, PlayCircle, Table } from "lucide-react";
import Link from "next/link";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { MappingProfile } from "@/types/MappingProfile";

interface ProfileCardProps {
  profile: MappingProfile;
}

export function ProfileCard({ profile }: ProfileCardProps) {
  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <GitBranch className="h-4 w-4 text-primary" />
            <CardTitle className="text-base">{profile.name}</CardTitle>
          </div>
          <StatusBadge status={profile.status} type="profile" />
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-2 gap-2 text-small">
          <div>
            <p className="text-text-muted">Source</p>
            <p className="text-text-secondary truncate">{profile.source_name || "-"}</p>
          </div>
          <div>
            <p className="text-text-muted">Destination</p>
            <p className="text-text-secondary truncate">{profile.dest_name || "-"}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Table className="h-3.5 w-3.5 text-text-muted" />
          <span className="font-mono text-[13px] text-text-muted">
            {profile.selection_set?.tables?.length || 0} tabel
          </span>
        </div>
        <div className="flex gap-2 pt-1">
          <Link href={`/profiles/${profile.id}`} className="flex-1">
            <Button variant="outline" size="sm" className="w-full">
              <Pencil className="mr-1.5 h-3.5 w-3.5" />
              Edit
            </Button>
          </Link>
          {profile.status === "ready" && (
            <Link href="/sessions" className="flex-1">
              <Button size="sm" className="w-full">
                <PlayCircle className="mr-1.5 h-3.5 w-3.5" />
                Sync
              </Button>
            </Link>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
