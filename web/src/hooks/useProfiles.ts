import { useCallback } from "react";
import useSWR, { mutate } from "swr";
import { profileService } from "../lib/services/profiles";
import type { MappingProfile } from "../types/MappingProfile";

const PROFILES_KEY = "profiles/list";

export function useProfiles() {
  return useSWR(PROFILES_KEY, () => profileService.list());
}

export function useProfile(id: string) {
  return useSWR(id ? `profiles/${id}` : null, () =>
    id ? profileService.get(id) : Promise.resolve(null),
  );
}

export function useRenameProfile() {
  const rename = useCallback(async (profileId: string, newName: string) => {
    await mutate(
      PROFILES_KEY,
      (current: MappingProfile[] | undefined) =>
        current?.map((p) => (p.id === profileId ? { ...p, name: newName } : p)),
      { rollbackOnError: true, revalidate: true },
    );
    await profileService.update(profileId, { name: newName });
  }, []);

  return { rename };
}

