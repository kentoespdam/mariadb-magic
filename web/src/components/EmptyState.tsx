/**
 * EmptyState.tsx
 *
 * Komponen untuk menampilkan state kosong (mis. tidak ada koneksi,
 * tidak ada profile) sesuai dengan Layout patterns di DESIGN.md.
 */

import { Button } from "@/components/ui/button";
import type { LucideIcon } from "lucide-react";
import Link from "next/link";

interface EmptyStateProps {
  title: string;
  description: string;
  icon: LucideIcon;
  action?: {
    label: string;
    href: string;
  };
}

export function EmptyState({
  title,
  description,
  icon: Icon,
  action,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center border border-border border-dashed rounded-md bg-surface-subtle">
      <div className="flex items-center justify-center w-12 h-12 mb-4 rounded-full bg-white border border-border">
        <Icon className="w-6 h-6 text-text-secondary" />
      </div>
      <h3 className="mb-1 text-lg font-semibold text-text">{title}</h3>
      <p className="max-w-xs mb-6 text-sm text-text-muted">{description}</p>
      {action && (
        <Button asChild>
          <Link href={action.href}>{action.label}</Link>
        </Button>
      )}
    </div>
  );
}
