import { useCallback } from "react";
import useSWR, { mutate } from "swr";
import { profileService } from "../lib/services/profiles";
import type { MappingProfile } from "../types/MappingProfile";

export function useToggleRule(profileId: string) {
  const toggle = useCallback(
    async (ruleId: string, enabled: boolean) => {
      await mutate(
        `profiles/${profileId}`,
        (current: MappingProfile | undefined) => current,
        { rollbackOnError: true, revalidate: true },
      );
      await profileService.update(profileId, {
        rules_json: JSON.stringify({ ruleId, enabled }),
      });
    },
    [profileId],
  );

  return { toggle };
}
