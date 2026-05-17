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

// Mock Radix Select because it's complex to test in jsdom
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

describe("PairingEditor", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders destination columns", () => {
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

  it("auto-matches exact column names", () => {
    render(
      <PairingEditor
        profile={mockProfile}
        schema={mockSchema}
        tableName="users"
      />,
    );

    // 'id' should be auto-matched (value 'column' for type select, and 'id' for column select)
    const selects = screen.getAllByTestId("mock-select") as HTMLSelectElement[];
    // first select is SourceType for 'id'
    expect(selects[0].value).toBe("column");
  });

  it("calls updatePairings when source type is changed", async () => {
    vi.mocked(profileService.updatePairings).mockResolvedValue(mockProfile);

    render(
      <PairingEditor
        profile={mockProfile}
        schema={mockSchema}
        tableName="users"
      />,
    );

    const selects = screen.getAllByTestId("mock-select") as HTMLSelectElement[];
    // first select is SourceType for 'id'
    fireEvent.change(selects[0], { target: { value: "null" } });

    await waitFor(() => {
      expect(profileService.updatePairings).toHaveBeenCalled();
    });
  });

  it("handles rules_json being an object instead of string", async () => {
    const profileWithObjRules = {
      ...mockProfile,
      rules_json: {
        users: {
          full_name: { type: "cast", cast: { target_type: "string" } },
        },
      },
    };
    vi.mocked(profileService.updatePairings).mockResolvedValue(mockProfile);

    render(
      <PairingEditor
        profile={profileWithObjRules}
        schema={mockSchema}
        tableName="users"
      />,
    );

    const selects = screen.getAllByTestId("mock-select") as HTMLSelectElement[];
    // Trigger an update (id column source type)
    fireEvent.change(selects[0], { target: { value: "null" } });

    await waitFor(() => {
      expect(profileService.updatePairings).toHaveBeenCalledWith(
        expect.any(String),
        expect.any(String),
        JSON.stringify(profileWithObjRules.rules_json),
      );
    });
  });

  it("handles column_pairings_json being an object instead of string", async () => {
    const profileWithObjMappings = {
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
          },
        ],
      },
    };
    vi.mocked(profileService.updatePairings).mockResolvedValue(mockProfile);

    render(
      <PairingEditor
        profile={profileWithObjMappings}
        schema={mockSchema}
        tableName="users"
      />,
    );

    const selects = screen.getAllByTestId("mock-select") as HTMLSelectElement[];
    // Trigger an update
    fireEvent.change(selects[0], { target: { value: "null" } });

    await waitFor(() => {
      expect(profileService.updatePairings).toHaveBeenCalledWith(
        expect.any(String),
        expect.stringContaining('"table_name":"users"'),
        expect.any(String),
      );
    });
  });
});
