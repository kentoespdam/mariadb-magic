export {
  ApiError,
  generateCorrelationId,
  apiGet,
  apiPost,
  apiPut,
  apiDelete,
} from "./apiClient";

export interface ApiErrorResponse {
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
}
