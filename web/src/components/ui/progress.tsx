"use client";

import { cn } from "@/lib/utils";

interface ProgressProps {
  value: number;
  variant?: "default" | "success" | "error" | "warning";
  className?: string;
}

export function Progress({ value, variant = "default", className }: ProgressProps) {
  const variantClasses = {
    default: "bg-primary",
    success: "bg-success",
    error: "bg-error",
    warning: "bg-warning",
  };

  return (
    <div className="w-full h-1.5 bg-border rounded-md overflow-hidden">
      <div
        className={cn(
          "h-full rounded-md transition-all duration-300",
          variantClasses[variant],
          className
        )}
        style={{ width: `${Math.max(0, Math.min(value, 100))}%` }}
      />
    </div>
  );
}
