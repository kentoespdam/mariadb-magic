package api

import (
	"encoding/json"
	"log/slog"
	"net/http"

	"magic-mariadb/internal/api/middleware"
)

type ErrorEnvelope struct {
	Error ErrorBody `json:"error"`
}

type ErrorBody struct {
	Code    string `json:"code"`
	Message string `json:"message"`
	Details any    `json:"details,omitempty"`
}

func WriteError(w http.ResponseWriter, r *http.Request, code, message string, details any, status int) {
	correlationID, _ := r.Context().Value(middleware.CorrelationIDKey).(string)
	if correlationID == "" {
		correlationID = "00000000-0000-0000-0000-000000000000"
	}

	w.Header().Set("Content-Type", "application/json")
	w.Header().Set("X-Correlation-ID", correlationID)
	w.WriteHeader(status)

	env := ErrorEnvelope{
		Error: ErrorBody{
			Code:    code,
			Message: message,
			Details: details,
		},
	}

	json.NewEncoder(w).Encode(env)

	slog.Error("request error",
		"correlation_id", correlationID,
		"code", code,
		"status", status,
		"path", r.URL.Path,
		"method", r.Method,
		"error", message,
	)
}