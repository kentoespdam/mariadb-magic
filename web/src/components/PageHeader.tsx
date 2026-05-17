/**
 * PageHeader.tsx
 *
 * Komponen header standar untuk halaman aplikasi.
 */

import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

interface PageHeaderProps {
  title: string;
  description?: string;
  actions?: ReactNode;
  className?: string;
}

export function PageHeader({
  title,
  description,
  actions,
  className,
}: PageHeaderProps) {
  return (
    <div className={cn("flex items-end justify-between mb-8", className)}>
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight text-text">
          {title}
        </h1>
        {description && (
          <p className="text-sm text-text-secondary">{description}</p>
        )}
      </div>
      {actions && <div className="flex items-center gap-3">{actions}</div>}
    </div>
  );
}
