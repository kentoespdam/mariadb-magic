import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { PairingEditor } from "./PairingEditor";
import type { MappingProfile, SchemaResponse } from "@/types/MappingProfile";
import { profileService } from "@/lib/services/profiles";
import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/services/profiles");
vi.mock("swr", () => ({
  mutate: vi.fn(),
  default: vi.fn(),
}));

// Mock Radix Select karena kompleks di-test di jsdom.
vi.mock("@/components/ui/select", () => ({
  Select: ({
    children,
    value,
    onValueChange,
  }: {
    children: React.ReactNode;
    value: string;
    onValueChange: (v: string) => void;
  }) => (
    <select
      value={value}
      onChange={(e) => onValueChange(e.target.value)}
      data-testid="mock-select"
    >
      {children}
    </select>
  ),
  SelectTrigger: ({ children }: { children: React.ReactNode }) => (
    <>{children}</>
  ),
  SelectValue: ({ placeholder }: { placeholder: string }) => <>{placeholder}</>,
  SelectContent: ({ children }: { children: React.ReactNode }) => (
    <>{children}</>
  ),
  SelectGroup: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  SelectItem: ({
    children,
    value,
  }: {
    children: React.ReactNode;
    value: string;
  }) => <option value={value}>{children}</option>,
  SelectLabel: ({ children }: { children: React.ReactNode }) => (
    <option disabled>{children}</option>
  ),
}));

const mockProfile: MappingProfile = {
  id: "prof_1",
  name: "Test",
  source_connection_id: "src",
  destination_connection_id: "dst",
  selection_json: '["users"]',
  column_pairings_json: '{"tables":[]}',
  rules_json: "[]",
  status: "draft",
  created_at: "",
  updated_at: "",
};

const mockSchema: SchemaResponse = {
  source_schema: {
    users: {
      id: { Name: "id", Nullable: false, Default: null, IsPK: true },
      name: { Name: "name", Nullable: true, Default: null, IsPK: false },
    },
  },
  dest_schema: {
    users: {
      id: { Name: "id", Nullable: false, Default: null, IsPK: true },
      full_name: {
        Name: "full_name",
        Nullable: true,
        Default: null,
        IsPK: false,
      },
    },
  },
  tables: [{ name: "users", role: "user_selected" }],
  available_tables: ["users"],
};

describe("PairingEditor (explicit commit per tabel — ADR-0024)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(profileService.updatePairings).mockResolvedValue(mockProfile);
  });

  it("render kolom Destination", () => {
    render(
      <PairingEditor
        profile={mockProfile}
        schema={mockSchema}
        tableName="users"
      />,
    );
    expect(screen.getAllByText("id").length).toBeGreaterThan(0);
    expect(screen.getByText("full_name")).toBeInTheDocument();
  });

  it("auto-match kolom dengan nama persis sama", () => {
    render(
      <PairingEditor
        profile={mockProfile}
        schema={mockSchema}
        tableName="users"
      />,
    );
    const selects = screen.getAllByTestId("mock-select") as HTMLSelectElement[];
    expect(selects[0].value).toBe("column");
  });

  it("TIDAK auto-save saat dropdown berubah — menunggu commit", async () => {
    render(
      <PairingEditor
        profile={mockProfile}
        schema={mockSchema}
        tableName="users"
      />,
    );
    const selects = screen.getAllByTestId("mock-select") as HTMLSelectElement[];
    fireEvent.change(selects[0], { target: { value: "null" } });

    // Beri waktu microtask + macrotask drain.
    await new Promise((r) => setTimeout(r, 50));
    expect(profileService.updatePairings).not.toHaveBeenCalled();
  });

  it("tombol Simpan disabled saat belum ada perubahan (isDirty=false)", () => {
    render(
      <PairingEditor
        profile={mockProfile}
        schema={mockSchema}
        tableName="users"
      />,
    );
    const saveBtn = screen.getByRole("button", { name: /simpan pairing/i });
    expect(saveBtn).toBeDisabled();
  });

  it("tombol Simpan enabled setelah perubahan (isDirty=true)", () => {
    render(
      <PairingEditor
        profile={mockProfile}
        schema={mockSchema}
        tableName="users"
      />,
    );
    const selects = screen.getAllByTestId("mock-select") as HTMLSelectElement[];
    fireEvent.change(selects[0], { target: { value: "null" } });
    const saveBtn = screen.getByRole("button", { name: /simpan pairing/i });
    expect(saveBtn).not.toBeDisabled();
  });

  it("commit memanggil updatePairings dengan draft state yang benar", async () => {
    render(
      <PairingEditor
        profile={mockProfile}
        schema={mockSchema}
        tableName="users"
      />,
    );
    const selects = screen.getAllByTestId("mock-select") as HTMLSelectElement[];
    fireEvent.change(selects[0], { target: { value: "null" } });
    const saveBtn = screen.getByRole("button", { name: /simpan pairing/i });
    fireEvent.click(saveBtn);

    await waitFor(() => {
      expect(profileService.updatePairings).toHaveBeenCalledTimes(1);
    });
    const call = vi.mocked(profileService.updatePairings).mock.calls[0];
    expect(call[0]).toBe("prof_1");
    expect(call[1]).toContain('"source_type":"null"');
  });

  it("commit me-merge dengan tabel lain yang sudah ada di mappings", async () => {
    const profileMulti = {
      ...mockProfile,
      column_pairings_json: {
        tables: [
          {
            table_name: "orders",
            column_pairs: [
              {
                dest_column: "id",
                is_pk: true,
                source_type: "column",
                source_column: "id",
                status: "resolved",
              },
            ],
            unresolved_cnt: 0,
            total_cols: 1,
          },
        ],
      },
    };

    render(
      <PairingEditor
        profile={profileMulti}
        schema={mockSchema}
        tableName="users"
      />,
    );

    const selects = screen.getAllByTestId("mock-select") as HTMLSelectElement[];
    fireEvent.change(selects[0], { target: { value: "null" } });
    const saveBtn = screen.getByRole("button", { name: /simpan pairing/i });
    fireEvent.click(saveBtn);

    await waitFor(() => {
      expect(profileService.updatePairings).toHaveBeenCalledTimes(1);
    });
    const payload = vi.mocked(profileService.updatePairings).mock.calls[0][1];
    // Entri tabel orders WAJIB ikut tersimpan (bug awal: ter-hapus).
    expect(payload).toContain('"table_name":"orders"');
    expect(payload).toContain('"table_name":"users"');
  });

  it("memanggil onDirtyChange saat draft berubah / di-commit", async () => {
    const onDirtyChange = vi.fn();
    render(
      <PairingEditor
        profile={mockProfile}
        schema={mockSchema}
        tableName="users"
        onDirtyChange={onDirtyChange}
      />,
    );

    const selects = screen.getAllByTestId("mock-select") as HTMLSelectElement[];
    fireEvent.change(selects[0], { target: { value: "null" } });

    await waitFor(() => {
      expect(onDirtyChange).toHaveBeenCalledWith("users", true);
    });

    const saveBtn = screen.getByRole("button", { name: /simpan pairing/i });
    fireEvent.click(saveBtn);

    await waitFor(() => {
      expect(onDirtyChange).toHaveBeenLastCalledWith("users", false);
    });
  });

  it("handle column_pairings_json sebagai object (bukan string)", async () => {
    const profileWithObj = {
      ...mockProfile,
      column_pairings_json: {
        tables: [
          {
            table_name: "users",
            column_pairs: [
              {
                dest_column: "id",
                is_pk: true,
                source_type: "column",
                source_column: "id",
                status: "resolved",
              },
            ],
            unresolved_cnt: 0,
            total_cols: 1,
          },
        ],
      },
    };

    render(
      <PairingEditor
        profile={profileWithObj}
        schema={mockSchema}
        tableName="users"
      />,
    );

    const selects = screen.getAllByTestId("mock-select") as HTMLSelectElement[];
    fireEvent.change(selects[0], { target: { value: "null" } });
    const saveBtn = screen.getByRole("button", { name: /simpan pairing/i });
    fireEvent.click(saveBtn);

    await waitFor(() => {
      expect(profileService.updatePairings).toHaveBeenCalledWith(
        "prof_1",
        expect.stringContaining('"table_name":"users"'),
        expect.any(String),
      );
    });
  });
});
