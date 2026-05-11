import {
  Database,
  FileStack,
  Activity,
  Settings,
  Palette,
  type LucideIcon,
} from "lucide-react";

export interface Command {
  id: string;
  label: string;
  icon: LucideIcon;
  run: () => void;
  keywords?: string[];
  group?: string;
}

export const commands: Command[] = [
  {
    id: "nav-connections",
    label: "Go to Connections",
    icon: Database,
    run: () => {
      window.location.href = "/connections";
    },
    keywords: ["connections", "database", "source", "destination"],
    group: "Navigation",
  },
  {
    id: "nav-profiles",
    label: "Go to Profiles",
    icon: FileStack,
    run: () => {
      window.location.href = "/profiles";
    },
    keywords: ["profiles", "mapping", "profile"],
    group: "Navigation",
  },
  {
    id: "nav-sessions",
    label: "Go to Sessions",
    icon: Activity,
    run: () => {
      window.location.href = "/sessions";
    },
    keywords: ["sessions", "sync", "running"],
    group: "Navigation",
  },
  {
    id: "nav-settings",
    label: "Go to Settings",
    icon: Settings,
    run: () => {
      window.location.href = "/settings";
    },
    keywords: ["settings", "config", "preferences"],
    group: "Navigation",
  },
  {
    id: "toggle-theme",
    label: "Toggle Theme",
    icon: Palette,
    run: () => {
      const event = new CustomEvent("toggle-theme");
      window.dispatchEvent(event);
    },
    keywords: ["theme", "dark", "light", "mode"],
    group: "Actions",
  },
];
