/**
 * MarkReadyButton.tsx
 *
 * Tombol untuk memvalidasi profile dan menandainya sebagai "ready".
 * Meng-handle error 400 (validasi) dan 409 (collision).
 */

"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { profileService } from "@/lib/services/profiles";
import type { MappingProfile, MarkReadyResponse } from "@/types/MappingProfile";
import { mutate } from "swr";
import { ApiError } from "@/lib/apiClient";

interface MarkReadyButtonProps {
  profile: MappingProfile;
  onResponse?: (resp: MarkReadyResponse | null) => void;
}

export function MarkReadyButton({ profile, onResponse }: MarkReadyButtonProps) {
  const [isPending, setIsPending] = useState(false);

  const handleMarkReady = async () => {
    setIsPending(true);
    onResponse?.(null);
    try {
      await profileService.markReady(profile.id);
      await mutate(`/api/profiles/${profile.id}`);
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.status === 400 || err.status === 409) {
          // Details berisi {valid: false, errors: []} atau {conflicts: []}
          onResponse?.(err.details as MarkReadyResponse);
          return;
        }
      }
      console.error("Gagal menandai profile sebagai siap:", err);
    } finally {
      setIsPending(false);
    }
  };

  if (profile.status === "ready") {
    return (
      <Button
        variant="outline"
        className="text-success border-success/30 bg-success/5 pointer-events-none"
      >
        ✓ Profil Siap
      </Button>
    );
  }

  return (
    <Button
      onClick={handleMarkReady}
      disabled={isPending}
      className={isPending ? "animate-pulse" : ""}
    >
      {isPending ? "Memvalidasi..." : "Tandai Siap"}
    </Button>
  );
}
