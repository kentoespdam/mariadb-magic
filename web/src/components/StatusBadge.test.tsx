import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { StatusBadge } from "./StatusBadge";

describe("StatusBadge", () => {
  it("renders with correct label for session status", () => {
    render(<StatusBadge type="session" status="RUNNING" />);
    expect(screen.getByText(/Running/i)).toBeDefined();
  });

  it("applies correct variant styles", () => {
    const { container } = render(<StatusBadge type="session" status="DONE" />);
    const badge = container.firstChild as HTMLElement;
    // DONE should have success variant classes
    expect(badge.className).toContain("text-[#15803D]");
  });
});
