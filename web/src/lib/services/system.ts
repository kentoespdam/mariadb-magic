import { apiGet } from "../apiClient";
import type { SystemInfo } from "../../types/SystemInfo";

export const systemService = {
  info: () => apiGet<SystemInfo>("/api/system/info"),
};
