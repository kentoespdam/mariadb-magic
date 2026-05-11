"use client";

import { useEffect } from "react";
import type { ReactNode } from "react";

export function A11yChecker({ children }: { children: ReactNode }) {
  useEffect(() => {
    if (process.env.NODE_ENV !== "development") return;
    if (typeof window === "undefined") return;

    let cancelled = false;
    void (async () => {
      const [{ default: React }, ReactDOM, axe] = await Promise.all([
        import("react"),
        import("react-dom"),
        import("@axe-core/react"),
      ]);
      if (cancelled) return;
      await axe.default(React, ReactDOM, 1000);
    })().catch(() => {});

    return () => {
      cancelled = true;
    };
  }, []);

  return <>{children}</>;
}