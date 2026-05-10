import { toast } from "sonner";

export class ApiError extends Error {
  constructor(
    message: string,
    public code?: string,
    public status?: number
  ) {
    super(message);
    this.name = "ApiError";
  }
}

interface ApiResponse<T> {
  data?: T;
  error?: {
    code: string;
    message: string;
  };
}

export async function apiFetch<T>(url: string, options?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const error = new ApiError(
      errorData.message || `HTTP ${response.status}`,
      errorData.code,
      response.status
    );
    toast.error(error.message);
    throw error;
  }

  return response.json();
}

export function getApiErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    return error.message;
  }
  if (error instanceof Error) {
    return error.message;
  }
  return "Terjadi kesalahan tak terduga";
}
