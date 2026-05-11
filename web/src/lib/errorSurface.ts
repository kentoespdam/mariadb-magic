import type { ApiError } from "./apiClient.types";

export type SurfaceLayer =
  | "field"
  | "form"
  | "page"
  | "background"
  | "blocking";

export function classifyError(err: ApiError): SurfaceLayer {
  if (
    err.code === "VALIDATION_FAILED" &&
    err.details &&
    typeof err.details === "object" &&
    "fields" in (err.details as Record<string, unknown>)
  ) {
    return "field";
  }
  if (err.code === "VALIDATION_FAILED") {
    return "form";
  }
  if (err.code === "CONFLICT_RUNNING_SESSION") {
    return "blocking";
  }
  if (err.status >= 500 || err.code === "INTERNAL") {
    return "page";
  }
  if (err.code === "NOT_FOUND") {
    return "page";
  }
  return "background";
}
