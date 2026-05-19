import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi, Mock } from "vitest";
import { SessionErrorList } from "./SessionErrorList";
import { useSessionLogs } from "@/hooks/useSessionLogs";

// Mock the hook
vi.mock("@/hooks/useSessionLogs", () => ({
  useSessionLogs: vi.fn(),
}));

describe("SessionErrorList", () => {
  it("renders null when there are no fatal errors", () => {
    (useSessionLogs as Mock).mockReturnValue({
      data: { items: [] },
    });

    const { container } = render(<SessionErrorList sessionId="123" />);
    expect(container.firstChild).toBeNull();
  });

  it("renders table when there are fatal errors", () => {
    (useSessionLogs as Mock).mockReturnValue({
      data: {
        items: [
          {
            id: "1",
            destination_table: "users",
            mariadb_code: 0,
            friendly_msg: "no mapping found",
          },
        ],
      },
    });

    render(<SessionErrorList sessionId="123" />);
    expect(screen.getByText(/users/i)).toBeDefined();
    expect(screen.getByText(/no mapping found/i)).toBeDefined();
  });
});
