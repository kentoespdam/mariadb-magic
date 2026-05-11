package middleware

import (
	"context"
	"github.com/google/uuid"
	"net/http"
)

type correlationIDKey string

const CorrelationIDKey correlationIDKey = "correlation_id"

func CorrelationID(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		cid := r.Header.Get("X-Correlation-ID")
		if cid == "" {
			cid = uuid.New().String()
		}

		ctx := context.WithValue(r.Context(), CorrelationIDKey, cid)
		w.Header().Set("X-Correlation-ID", cid)

		next.ServeHTTP(w, r.WithContext(ctx))
	})
}