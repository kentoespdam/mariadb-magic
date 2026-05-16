import { useCallback } from "react";
import { profileService } from "../lib/services/profiles";
import { mutate } from "swr";

export function useApplyRule(profileId: string) {
  const applyRule = useCallback(
    async (rulesJson: string) => {
      await profileService.updateRules(profileId, rulesJson);
      await mutate(`profiles/${profileId}`);
    },
    [profileId],
  );

  return { applyRule };
}
