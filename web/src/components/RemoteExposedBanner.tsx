"use client";

import { useSystemInfo } from "../hooks/useSystemInfo";
import { AlertCircle } from "lucide-react";

export function RemoteExposedBanner() {
  const { data, isLoading } = useSystemInfo();

  if (isLoading || !data?.remote_exposed) {
    return null;
  }

  return (
    <div className="bg-destructive/10 border border-destructive text-destructive-foreground px-4 py-3 flex items-center gap-2">
      <AlertCircle className="h-4 w-4 flex-shrink-0" />
      <span className="text-sm">
        Remote access enabled. API not authenticated. Bind to 127.0.0.1 for
        security.
      </span>
    </div>
  );
}
