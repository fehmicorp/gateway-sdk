package handlers

import (
	"context"
	"net/http"
	"time"

	"havrrp/pkg/app"
)

// HealthCheckHandler verifies the operational state of the backend and underlying datastores.
func HealthCheckHandler(container *app.AppContainer) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		ctx, cancel := context.WithTimeout(r.Context(), 3*time.Second)
		defer cancel()

		traceID := app.GetTraceID(ctx)

		// Run deep infrastructure health check
		if err := container.CheckHealth(ctx); err != nil {
			app.WriteJSON(w, http.StatusServiceUnavailable, app.Envelope{
				"status":   "unhealthy",
				"error":    err.Error(),
				"trace_id": traceID,
			}, nil)
			return
		}

		app.WriteJSON(w, http.StatusOK, app.Envelope{
			"status":    "healthy",
			"trace_id":  traceID,
			"timestamp": time.Now().UTC(),
		}, nil)
	}
}
