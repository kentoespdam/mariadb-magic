import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { TablePicker } from "./TablePicker";
import type { SchemaResponse, MappingProfile } from "@/types/MappingProfile";
import { profileService } from "@/lib/services/profiles";
import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/services/profiles");
vi.mock("swr", () => ({
  mutate: vi.fn(),
  default: vi.fn(),
}));

const mockSchema: SchemaResponse = {
  source_schema: {},
  dest_schema: {},
  tables: [
    { name: "users", role: "user_selected" },
    { name: "posts", role: "advisor_added" },
  ],
  available_tables: ["users", "posts", "comments"],
};

describe("TablePicker", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders all available tables", () => {
    render(<TablePicker profileId="prof_1" schema={mockSchema} />);

    expect(screen.getByText("users")).toBeInTheDocument();
    expect(screen.getByText("posts")).toBeInTheDocument();
    expect(screen.getByText("comments")).toBeInTheDocument();
  });

  it("checks selected and advisor tables", () => {
    render(<TablePicker profileId="prof_1" schema={mockSchema} />);

    const usersCheckbox = screen.getByLabelText(/users/) as HTMLInputElement;
    const postsCheckbox = screen.getByLabelText(/posts/) as HTMLInputElement;
    const commentsCheckbox = screen.getByLabelText(
      /comments/,
    ) as HTMLInputElement;

    expect(usersCheckbox.checked).toBe(true);
    expect(postsCheckbox.checked).toBe(true);
    expect(commentsCheckbox.checked).toBe(false);
  });

  it("disables advisor tables", () => {
    render(<TablePicker profileId="prof_1" schema={mockSchema} />);

    const postsCheckbox = screen.getByLabelText(/posts/) as HTMLInputElement;
    expect(postsCheckbox.disabled).toBe(true);
  });

  it("calls profileService.update on save", async () => {
    vi.mocked(profileService.update).mockResolvedValue({} as MappingProfile);

    render(<TablePicker profileId="prof_1" schema={mockSchema} />);

    const commentsCheckbox = screen.getByLabelText(/comments/);
    fireEvent.click(commentsCheckbox);

    const saveButton = screen.getByText("Simpan Seleksi");
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(profileService.update).toHaveBeenCalledWith("prof_1", {
        tables: ["users", "comments"],
      });
    });
  });
});
