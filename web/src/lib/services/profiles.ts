import { apiGet, apiPost, apiPut, apiDelete } from "../apiClient";
import type {
  MappingProfile,
  CreateProfileInput,
  DriftReport,
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

  updatePairings: (id: string, pairings: string) =>
    apiPut<MappingProfile, { column_pairings_json: string }>(
      `/api/profiles/${id}/pairings`,
      {
        column_pairings_json: pairings,
      },
    ),

  // Update rules_json lewat endpoint pairings (BE menerima dua field di body sama).
  updateRules: (id: string, rulesJson: string) =>
    apiPut<MappingProfile, { rules_json: string }>(
      `/api/profiles/${id}/pairings`,
      { rules_json: rulesJson },
    ),

  markReady: (id: string) =>
    apiPost<MappingProfile>(`/api/profiles/${id}/mark-ready`, {}),

  downgrade: (id: string) =>
    apiPost<MappingProfile>(`/api/profiles/${id}/downgrade`, {}),

  preflight: (id: string) =>
    apiGet<DriftReport>(`/api/profiles/${id}/preflight`),
};
