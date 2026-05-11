import { apiGet, apiPost, apiPut, apiDelete } from "../apiClient";
import type {
  MappingProfile,
  MappingProfileInput,
  DriftReport,
} from "../../types/MappingProfile";

export const profileService = {
  list: () => apiGet<MappingProfile[]>("/api/profiles/"),

  get: (id: string) => apiGet<MappingProfile>(`/api/profiles/${id}`),

  create: (input: MappingProfileInput) =>
    apiPost<MappingProfile, MappingProfileInput>("/api/profiles/", input),

  update: (id: string, input: Partial<MappingProfileInput>) =>
    apiPut<MappingProfile, Partial<MappingProfileInput>>(
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

  markReady: (id: string) =>
    apiPost<MappingProfile>(`/api/profiles/${id}/mark-ready`, {}),

  downgrade: (id: string) =>
    apiPost<MappingProfile>(`/api/profiles/${id}/downgrade`, {}),

  preflight: (id: string) =>
    apiGet<DriftReport>(`/api/profiles/${id}/preflight`),
};
