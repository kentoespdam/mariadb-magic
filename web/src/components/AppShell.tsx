"use client";

import { Database, GitBranch, PlayCircle, Settings2 } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/connections", label: "Koneksi", icon: Database },
  { href: "/profiles", label: "Mapping Profile", icon: GitBranch },
  { href: "/sessions", label: "Sync Sessions", icon: PlayCircle },
  { href: "/settings", label: "Pengaturan", icon: Settings2 },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="flex h-screen">
      <aside className="flex w-60 flex-col border-r border-border bg-surface-subtle">
        <div className="flex h-14 items-center border-b border-border px-4">
          <h1 className="text-h3 font-semibold text-text">MagicSync</h1>
        </div>
        <nav className="flex-1 p-3">
          <ul className="space-y-1">
            {NAV_ITEMS.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 rounded px-3 py-2 text-[14px] transition-colors",
                      isActive
                        ? "bg-background text-primary border-l-2 border-primary font-medium"
                        : "text-text-secondary hover:bg-muted hover:text-text"
                    )}
                  >
                    <item.icon className="h-4 w-4" />
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </aside>
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  );
}
