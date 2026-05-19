import { apiGet, apiPost, apiPut, apiDelete } from "../apiClient";
import type {
  MappingProfile,
  CreateProfileInput,
  DriftReport,
  SchemaResponse,
  Rule,
  PreviewResult,
} from "../../types/MappingProfile";

export const profileService = {
  list: () => apiGet<MappingProfile[]>("/api/profiles/"),

  get: (id: string) => apiGet<MappingProfile>(`/api/profiles/${id}`),

  create: (input: CreateProfileInput) =>
    apiPost<MappingProfile, CreateProfileInput>("/api/profiles/", input),

  update: (id: string, input: Partial<CreateProfileInput>) =>
    apiPut<MappingProfile, Partial<CreateProfileInput>>(
      `/api/profiles/${id}`,
      input,
    ),

  delete: (id: string, opts?: { cascade?: boolean }) => {
    const params = opts?.cascade ? "?cascade=true" : "";
    return apiDelete<void>(`/api/profiles/${id}${params}`);
  },

  updatePairings: (id: string, pairings: string, rules: string) =>
    apiPost<MappingProfile>(`/api/profiles/${id}/pairings`, {
      column_pairings_json: pairings,
      rules_json: rules,
    }),

  markReady: (id: string) =>
    apiPost<MappingProfile>(`/api/profiles/${id}/mark-ready`, {}),

  downgrade: (id: string) =>
    apiPost<MappingProfile>(`/api/profiles/${id}/downgrade`, {}),

  preflight: (id: string) =>
    apiGet<DriftReport>(`/api/profiles/${id}/preflight`),

  getSchema: (id: string) =>
    apiGet<SchemaResponse>(`/api/profiles/${id}/schema`),

  previewRule: (input: {
    rule: Rule;
    source_connection_id: string;
    table: string;
    column: string;
  }) =>
    apiPost<PreviewResult[]>("/api/preview/rule", {
      rule_dsl: JSON.stringify(input.rule),
      source_connection_id: input.source_connection_id,
      table: input.table,
      column: input.column,
    }),
};
