"use client";

import { useEffect } from "react";
import type { ReactNode } from "react";

export function A11yChecker({ children }: { children: ReactNode }) {
  useEffect(() => {
    if (process.env.NODE_ENV !== "development") return;

    let axe: { default?: { open: (modal: unknown) => void } } | null = null;

    import("@axe-core/react")
      .then((m) => {
        axe = m as typeof axe;
        if (typeof m.default?.open === "function") {
          m.default.open(
            undefined as unknown as Parameters<typeof m.default.open>[0],
          );
        }
      })
      .catch(() => {});

    return () => {
      axe = null;
    };
  }, []);

  return <>{children}</>;
}
