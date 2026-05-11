import { apiGet } from "../apiClient";
import type { DriftReport } from "../../types/MappingProfile";

export const preflightService = {
  run: (profileId: string) =>
    apiGet<DriftReport>(`/api/profiles/${profileId}/preflight`),
};
