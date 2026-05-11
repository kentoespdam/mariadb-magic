import useSWR from "swr";
import { systemService } from "../lib/services/system";
import type { SystemInfo } from "../types/SystemInfo";

export function useSystemInfo() {
  return useSWR<SystemInfo>("system/info", () => systemService.info(), {
    revalidateOnFocus: false,
    dedupingInterval: 60000,
  });
}
