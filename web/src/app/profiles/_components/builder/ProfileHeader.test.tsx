import { render, screen } from "@testing-library/react";
import { ProfileHeader } from "./ProfileHeader";
import type { MappingProfile } from "@/types/MappingProfile";
import { describe, it, expect, vi } from "vitest";

// Mock next/link because it doesn't work well in jsdom without a router
vi.mock("next/link", () => ({
  default: ({
    children,
    href,
  }: {
    children: React.ReactNode;
    href: string;
  }) => <a href={href}>{children}</a>,
}));

const mockProfile: MappingProfile = {
  id: "prof_123",
  name: "Test Profile",
  source_connection_id: "src_1",
  destination_connection_id: "dst_1",
  selection_json: "[]",
  column_pairings_json: "[]",
  rules_json: "[]",
  status: "draft",
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

describe("ProfileHeader", () => {
  it("renders profile name and status", () => {
    render(
      <ProfileHeader profile={mockProfile} onMarkReadyResponse={vi.fn()} />,
    );

    expect(screen.getByText("Test Profile")).toBeInTheDocument();
    expect(screen.getByText("Draft")).toBeInTheDocument();
  });

  it("renders ready status correctly", () => {
    render(
      <ProfileHeader
        profile={{ ...mockProfile, status: "ready" }}
        onMarkReadyResponse={vi.fn()}
      />,
    );

    expect(screen.getByText("Ready")).toBeInTheDocument();
  });

  it("has a back button to home", () => {
    render(
      <ProfileHeader profile={mockProfile} onMarkReadyResponse={vi.fn()} />,
    );

    const backLink = screen.getByRole("link");
    expect(backLink).toHaveAttribute("href", "/");
  });
});
