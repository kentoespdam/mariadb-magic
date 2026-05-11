import type { Config } from "tailwindcss";

export default {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./node_modules/shadcn-ui/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: { DEFAULT: "#2563EB", hover: "#1D4ED8", active: "#1E40AF" },
        surface: { DEFAULT: "#FFFFFF", subtle: "#F8FAFC" },
        border: { DEFAULT: "#E2E8F0", strong: "#CBD5E1" },
        text: { DEFAULT: "#0F172A", secondary: "#475569", muted: "#94A3B8" },
        success: "#16A34A",
        warning: "#D97706",
        error: "#DC2626",
        info: "#0891B2",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "-apple-system", "Segoe UI", "sans-serif"],
        mono: [
          "JetBrains Mono",
          "ui-monospace",
          "SFMono-Regular",
          "Menlo",
          "monospace",
        ],
      },
      borderRadius: { sm: "4px", md: "6px", lg: "8px" },
    },
  },
} satisfies Config;
