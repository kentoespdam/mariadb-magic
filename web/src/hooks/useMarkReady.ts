import { useCallback, useState } from "react";
import { profileService } from "../lib/services/profiles";
import { mutate } from "swr";

export function useMarkReady() {
  const [isMarkingReady, setIsMarkingReady] = useState(false);

  const markReady = useCallback(async (profileId: string) => {
    setIsMarkingReady(true);
    try {
      await profileService.markReady(profileId);
      await mutate("profiles/list");
      await mutate(`profiles/${profileId}`);
    } finally {
      setIsMarkingReady(false);
    }
  }, []);

  return { markReady, isMarkingReady };
}
