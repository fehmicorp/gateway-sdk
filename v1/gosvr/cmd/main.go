package main

import (
	"context"
	"fmt"
	"havrrp/pkg/app"
	"log/slog"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	// "github.com/fehmicorp/go-backend/pkg/app"
	// "github.com/fehmicorp/go-backend/pkg/handlers"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/redis/go-redis/v9"
)

type Config struct {
	PGConnString string
	RedisAddr    string
	RedisPass    string
	RedisDB      int
	ServerPort   string
}

func main() {
	start()
}

func start() {
	logger := slog.New(slog.NewJSONHandler(os.Stdout, nil))
	slog.SetDefault(logger)

	cfg := loadConfig()
	ctx, cancel := signal.NotifyContext(context.Background(), os.Interrupt, syscall.SIGTERM)
	defer cancel()

	slog.Info("Starting backend server initialization...")

	// 1. Connect to PostgreSQL Pool
	dbPool, err := initPostgres(ctx, cfg.PGConnString)
	if err != nil {
		slog.Error("PostgreSQL initialization failed", "error", err)
		os.Exit(1)
	}
	defer dbPool.Close()
	slog.Info("Successfully established PostgreSQL connection pool")

	// 2. Connect to Redis Client
	redisClient, err := initRedis(ctx, cfg)
	if err != nil {
		slog.Error("Redis initialization failed", "error", err)
		os.Exit(1)
	}
	defer func() {
		if err := redisClient.Close(); err != nil {
			slog.Error("Failed to close Redis connection safely", "error", err)
		}
	}()
	slog.Info("Successfully established Redis client connection")

	// 3. Initialize Application Container & Routes
	container := app.NewContainer(dbPool, redisClient)
	container.Router.HandleFunc("GET /healthz", handlers.HealthCheckHandler(container))

	// 4. Run initial health connectivity verification
	if err := container.CheckHealth(ctx); err != nil {
		slog.Error("Startup health check failed", "error", err)
		os.Exit(1)
	}

	// 5. Start HTTP Server
	srv := container.StartServer(":" + cfg.ServerPort)
	go func() {
		if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			slog.Error("HTTP server runtime error", "error", err)
			os.Exit(1)
		}
	}()

	slog.Info("All backend infrastructure components registered successfully", "port", cfg.ServerPort)

	// Block execution until interruption signal is caught
	<-ctx.Done()
	slog.Info("Shutdown signal caught. Cleaning up resources...")

	shutdownCtx, shutdownCancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer shutdownCancel()

	if err := srv.Shutdown(shutdownCtx); err != nil {
		slog.Error("Server forced shutdown", "error", err)
	}

	slog.Info("Server exited gracefully")
}

func initPostgres(ctx context.Context, connString string) (*pgxpool.Pool, error) {
	config, err := pgxpool.ParseConfig(connString)
	if err != nil {
		return nil, fmt.Errorf("failed to parse config string: %w", err)
	}

	config.MaxConns = 25
	config.MinConns = 5
	config.MaxConnLifetime = 30 * time.Minute
	config.MaxConnIdleTime = 5 * time.Minute

	pool, err := pgxpool.NewWithConfig(ctx, config)
	if err != nil {
		return nil, fmt.Errorf("failed to create pool: %w", err)
	}

	pingCtx, pingCancel := context.WithTimeout(ctx, 5*time.Second)
	defer pingCancel()

	if err := pool.Ping(pingCtx); err != nil {
		pool.Close()
		return nil, fmt.Errorf("postgres ping test failed: %w", err)
	}

	return pool, nil
}

func initRedis(ctx context.Context, cfg Config) (*redis.Client, error) {
	rdb := redis.NewClient(&redis.Options{
		Addr:         cfg.RedisAddr,
		Password:     cfg.RedisPass,
		DB:           cfg.RedisDB,
		DialTimeout:  5 * time.Second,
		ReadTimeout:  3 * time.Second,
		WriteTimeout: 3 * time.Second,
		PoolSize:     20,
	})

	pingCtx, pingCancel := context.WithTimeout(ctx, 5*time.Second)
	defer pingCancel()

	if err := rdb.Ping(pingCtx).Err(); err != nil {
		return nil, fmt.Errorf("redis ping test failed: %w", err)
	}

	return rdb, nil
}

func loadConfig() Config {
	return Config{
		PGConnString: getEnv("POSTGRES_URL", "postgres://postgres:postgres@127.0.0.1:5432/gateway_db?sslmode=disable"),
		RedisAddr:    getEnv("REDIS_ADDR", "127.0.0.1:6379"),
		RedisPass:    getEnv("REDIS_PASSWORD", ""),
		RedisDB:      0,
		ServerPort:   getEnv("PORT", "4041"),
	}
}

func getEnv(key, defaultValue string) string {
	if val, ok := os.LookupEnv(key); ok && val != "" {
		return val
	}
	return defaultValue
}
