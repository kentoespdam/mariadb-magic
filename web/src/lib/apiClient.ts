export class ApiError extends Error {
  readonly code: string;
  readonly details: unknown;
  readonly status: number;
  readonly correlationId: string | null;

  constructor(
    code: string,
    message: string,
    details: unknown,
    status: number,
    correlationId: string | null,
  ) {
    super(message);
    this.name = "ApiError";
    this.code = code;
    this.details = details;
    this.status = status;
    this.correlationId = correlationId;
  }
}

export function generateCorrelationId(): string {
  return crypto.randomUUID();
}

async function request<T>(
  path: string,
  method: string,
  body?: unknown,
): Promise<T> {
  const correlationId = generateCorrelationId();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    "X-Correlation-ID": correlationId,
  };

  const response = await fetch(path, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await response.json();

  if (!response.ok) {
    const error = data.error || {
      code: "UNKNOWN_ERROR",
      message: "An unknown error occurred",
    };
    throw new ApiError(
      error.code,
      error.message,
      error.details,
      response.status,
      response.headers.get("X-Correlation-ID"),
    );
  }

  return data as T;
}

export async function apiGet<T>(path: string): Promise<T> {
  return request<T>(path, "GET");
}

export async function apiPost<T, B = unknown>(
  path: string,
  body: B,
): Promise<T> {
  return request<T>(path, "POST", body);
}

export async function apiPut<T, B = unknown>(
  path: string,
  body: B,
): Promise<T> {
  return request<T>(path, "PUT", body);
}

export async function apiDelete<T>(path: string): Promise<T> {
  return request<T>(path, "DELETE");
}
