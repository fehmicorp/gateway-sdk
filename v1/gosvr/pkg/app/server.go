package app

import (
	"context"
	"fmt"
	"log/slog"
	"net/http"
	"time"

	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/redis/go-redis/v9"
)

// AppContainer holds global dependencies shared across application routes and background workers.
type AppContainer struct {
	DB     *pgxpool.Pool
	Redis  *redis.Client
	Router *http.ServeMux
}

// NewContainer instantiates the core application server state.
func NewContainer(db *pgxpool.Pool, rdb *redis.Client) *AppContainer {
	return &AppContainer{
		DB:     db,
		Redis:  rdb,
		Router: http.NewServeMux(),
	}
}

// RegisterGlobalMiddleware wraps the root router with essential production middleware layers.
func (a *AppContainer) RegisterGlobalMiddleware() http.Handler {
	var handler http.Handler = a.Router

	// Apply tracing and request logging middleware
	handler = InjectTraceID(handler)

	return handler
}

// StartServer spins up an HTTP server with production-grade timeout configurations.
func (a *AppContainer) StartServer(addr string) *http.Server {
	srv := &http.Server{
		Addr:         addr,
		Handler:      a.RegisterGlobalMiddleware(),
		IdleTimeout:  time.Minute,
		ReadTimeout:  10 * time.Second,
		WriteTimeout: 30 * time.Second,
	}

	slog.Info("HTTP server bound and listening", "addr", addr)
	return srv
}

// CheckHealth executes deep health evaluation against dependent backends.
func (a *AppContainer) CheckHealth(ctx context.Context) error {
	if err := a.DB.Ping(ctx); err != nil {
		return fmt.Errorf("database health check failure: %w", err)
	}

	if err := a.Redis.Ping(ctx).Err(); err != nil {
		return fmt.Errorf("redis health check failure: %w", err)
	}

	return nil
}
