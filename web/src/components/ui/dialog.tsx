"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

const Dialog = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
  }
>(({ className, open, onOpenChange, ...props }, ref) => {
  if (!open) return null;
  return (
    <div
      ref={ref}
      role="dialog"
      aria-modal="true"
      className={cn(
        "fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm",
        className,
      )}
      onClick={() => onOpenChange?.(false)}
      onKeyDown={(e) => {
        if (e.key === "Escape") onOpenChange?.(false);
      }}
    >
      <div
        role="document"
        className="relative w-full max-w-lg rounded-lg border bg-background p-6 shadow-lg"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={(e) => e.stopPropagation()}
        {...props}
      />
    </div>
  );
});
Dialog.displayName = "Dialog";

const DialogContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, children, ...props }, ref) => (
  <div ref={ref} className={cn("relative", className)} {...props}>
    {children}
  </div>
));
DialogContent.displayName = "DialogContent";

export { Dialog, DialogContent };
