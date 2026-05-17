"use client";

import { useSearchParams } from "next/navigation";
import ProfileDetailClient from "../_components/builder/ProfileDetailClient";
import { Suspense } from "react";
import { LoadingBoundary } from "@/components/LoadingBoundary";

function EditProfileContent() {
  const searchParams = useSearchParams();
  const id = searchParams.get("id");

  if (!id) {
    return (
      <div className="mx-auto max-w-5xl px-6 py-8">
        <p className="text-destructive">ID Profil tidak ditemukan dalam URL.</p>
      </div>
    );
  }

  return <ProfileDetailClient id={id} />;
}

export default function EditProfilePage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-5xl px-6 py-8">
          <LoadingBoundary variant="two-pane-split" />
        </div>
      }
    >
      <EditProfileContent />
    </Suspense>
  );
}
