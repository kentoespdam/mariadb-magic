import type { ApiError } from "./apiClient.types";

export async function withErrorToast<T>(
  fn: () => Promise<T>,
  errorMessage: string,
  onSuccess?: () => void,
): Promise<T | undefined> {
  try {
    const result = await fn();
    onSuccess?.();
    return result;
  } catch (err) {
    console.error(errorMessage, err);
    return undefined;
  }
}
