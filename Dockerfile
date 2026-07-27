# ==========================================
# STAGE 1: Build Go Backend Binary
# ==========================================
FROM golang:1.26-alpine AS backend-builder

WORKDIR /build/backend
COPY v1/gosvr/go.mod v1/gosvr/go.sum* ./
RUN go mod download
COPY v1/gosvr/ .
RUN CGO_ENABLED=0 GOOS=linux go build -ldflags="-w -s" -o /build/gosvr-bin ./cmd


# ==========================================
# STAGE 2: Build Next.js Frontend App
# ==========================================
FROM node:20-alpine AS frontend-builder

WORKDIR /build/frontend
COPY v1/app/package.json v1/app/package-lock.json* v1/app/pnpm-lock.yaml* v1/app/yarn.lock* ./
RUN \
  if [ -f pnpm-lock.yaml ]; then corepack enable pnpm && pnpm i --frozen-lockfile; \
  elif [ -f package-lock.json ]; then npm ci; \
  elif [ -f yarn.lock ]; then yarn --frozen-lockfile; \
  else npm install; \
  fi

COPY v1/app/ .
ENV NEXT_TELEMETRY_DISABLED 1
RUN npm run build


# ==========================================
# STAGE 3: Secure Embedded Production Runtime
# ==========================================
FROM node:20-alpine AS runner

# Install Postgres 16, Redis, Supervisord, and OpenSSL for auto-password generation
RUN apk add --no-cache \
    supervisor \
    postgresql16 \
    postgresql16-client \
    redis \
    bash \
    openssl \
    ca-certificates \
    su-exec

WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

# Copy build artifacts
COPY --from=backend-builder /build/gosvr-bin /app/gosvr-bin
COPY --from=frontend-builder /build/frontend/public ./public
COPY --from=frontend-builder /build/frontend/.next/standalone ./
COPY --from=frontend-builder /build/frontend/.next/static ./.next/static

# Copy entrypoint initialization script
COPY v1/start.sh /app/start.sh
RUN chmod +x /app/start.sh

# Configure Supervisord workspace
RUN mkdir -p /etc/supervisor/conf.d /run/postgresql /var/lib/redis
RUN chown -R postgres:postgres /run/postgresql /var/lib/postgresql

RUN echo $'[supervisord]\n\
nodaemon=true\n\
logfile=/dev/null\n\
logfile_maxbytes=0\n\
\n\
[program:postgresql]\n\
command=su-exec postgres postgres -D /var/lib/postgresql/data\n\
autostart=true\n\
autorestart=true\n\
stdout_logfile=/dev/stdout\n\
stdout_logfile_maxbytes=0\n\
stderr_logfile=/dev/stderr\n\
stderr_logfile_maxbytes=0\n\
\n\
[program:redis]\n\
command=sh -c "redis-server --dir /var/lib/redis --requirepass $(grep REDIS_PASSWORD /app/.env.internal | cut -d= -f2)"\n\
autostart=true\n\
autorestart=true\n\
stdout_logfile=/dev/stdout\n\
stdout_logfile_maxbytes=0\n\
stderr_logfile=/dev/stderr\n\
stderr_logfile_maxbytes=0\n\
\n\
[program:gosvr]\n\
command=/app/gosvr-bin\n\
directory=/app\n\
autostart=true\n\
autorestart=true\n\
environment=PORT="4041",DATABASE_URL="postgresql://postgres:%(ENV_POSTGRES_PASSWORD)s@127.0.0.1:5432/gateway_db?sslmode=disable",REDIS_ADDR="127.0.0.1:6379",REDIS_PASSWORD="%(ENV_REDIS_PASSWORD)s"\n\
stdout_logfile=/dev/stdout\n\
stdout_logfile_maxbytes=0\n\
stderr_logfile=/dev/stderr\n\
stderr_logfile_maxbytes=0\n\
\n\
[program:next-frontend]\n\
command=node server.js\n\
directory=/app\n\
autostart=true\n\
autorestart=true\n\
environment=PORT="4040",HOSTNAME="0.0.0.0",DATABASE_URL="postgresql://postgres:%(ENV_POSTGRES_PASSWORD)s@127.0.0.1:5432/gateway_db?sslmode=disable",REDIS_ADDR="127.0.0.1:6379",REDIS_PASSWORD="%(ENV_REDIS_PASSWORD)s"\n\
stdout_logfile=/dev/stdout\n\
stdout_logfile_maxbytes=0\n\
stderr_logfile=/dev/stderr\n\
stderr_logfile_maxbytes=0\n\
' > /etc/supervisor/conf.d/supervisord.conf

# ONLY expose 4040 (Frontend) and 4041 (Backend API)
EXPOSE 4040 4041

ENTRYPOINT ["/app/start.sh"]