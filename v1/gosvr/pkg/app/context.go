package app

import (
	"context"
	"net/http"

	"github.com/google/uuid"
)

type contextKey string

const (
	TraceIDKey contextKey = "trace_id"
)

// InjectTraceID extracts an incoming X-Request-ID or generates a new UUID for request tracing.
func InjectTraceID(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		traceID := r.Header.Get("X-Request-ID")
		if traceID == "" {
			traceID = uuid.New().String()
		}

		ctx := context.WithValue(r.Context(), TraceIDKey, traceID)
		w.Header().Set("X-Request-ID", traceID)

		next.ServeHTTP(w, r.WithContext(ctx))
	})
}

// GetTraceID safely retrieves the trace ID from the request context.
func GetTraceID(ctx context.Context) string {
	if val, ok := ctx.Value(TraceIDKey).(string); ok {
		return val
	}
	return "unknown"
}
