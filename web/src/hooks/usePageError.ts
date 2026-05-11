import { useState, useCallback } from "react";
import type { ApiError } from "../lib/apiClient.types";

export function usePageError() {
  const [error, setError] = useState<ApiError | null>(null);

  const set = useCallback((err: ApiError) => {
    setError(err);
  }, []);

  const clear = useCallback(() => {
    setError(null);
  }, []);

  const retry = useCallback(() => {
    clear();
    window.location.reload();
  }, [clear]);

  return { error, set, clear, retry };
}
