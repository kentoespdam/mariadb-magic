import { useCallback, useState } from "react";
import { sessionService } from "../lib/services/sessions";
import { mutate } from "swr";

export function useStartSync() {
  const [isStarting, setIsStarting] = useState(false);

  const startSync = useCallback(async (profileId: string) => {
    setIsStarting(true);
    try {
      const session = await sessionService.start(profileId);
      await mutate("sessions/list");
      await mutate(`sessions/${session.id}`);
      return session;
    } finally {
      setIsStarting(false);
    }
  }, []);

  return { startSync, isStarting };
}
