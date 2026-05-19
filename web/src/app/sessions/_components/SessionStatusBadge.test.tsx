import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { SessionStatusBadge } from "./SessionStatusBadge";

describe("SessionStatusBadge", () => {
  it("renders 'failed' status correctly", () => {
    render(<SessionStatusBadge status="failed" />);
    expect(screen.getByText(/Gagal/i)).toBeDefined();
  });

  it("renders 'done' status correctly", () => {
    render(<SessionStatusBadge status="done" />);
    expect(screen.getByText(/Selesai/i)).toBeDefined();
  });

  it("renders 'running' status correctly", () => {
    render(<SessionStatusBadge status="running" />);
    expect(screen.getByText(/Sedang Berjalan/i)).toBeDefined();
  });
});
