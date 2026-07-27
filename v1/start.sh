#!/bin/bash
set -e

ENV_FILE="/app/.env.internal"

# 1. Generate secure random passwords if not already present
if [ ! -f "$ENV_FILE" ]; then
    echo "==> Auto-generating secure internal credentials..."
    PG_PASS=$(openssl rand -hex 16)
    REDIS_PASS=$(openssl rand -hex 16)
    
    cat <<EOF > "$ENV_FILE"
POSTGRES_USER=postgres
POSTGRES_PASSWORD=$PG_PASS
POSTGRES_DB=gateway_db
POSTGRES_URL=postgres://postgres:$PG_PASS@127.0.0.1:5432/gateway_db?sslmode=disable
REDIS_PASSWORD=$REDIS_PASS
REDIS_ADDR=127.0.0.1:6379
PORT=4041
EOF
fi

# Load variables into current shell
export $(cat "$ENV_FILE" | xargs)

# 2. Initialize PostgreSQL Data Directory
if [ ! -d "/var/lib/postgresql/data/base" ]; then
    echo "==> Initializing PostgreSQL data cluster..."
    chown -R postgres:postgres /var/lib/postgresql
    su-exec postgres initdb -D /var/lib/postgresql/data
    echo "listen_addresses='127.0.0.1'" >> /var/lib/postgresql/data/postgresql.conf
fi

# 3. Start local PostgreSQL & Redis temporarily for setup
echo "==> Bootstrapping local database and cache..."
su-exec postgres pg_ctl -D /var/lib/postgresql/data -l /tmp/postgres.log start
redis-server --daemonize yes --dir /var/lib/redis --requirepass "$REDIS_PASSWORD"

# Wait for Postgres ready state
until pg_isready -h 127.0.0.1 -p 5432; do
    sleep 1
done

# Apply credentials to Postgres engine
su-exec postgres psql -c "ALTER USER postgres WITH PASSWORD '$POSTGRES_PASSWORD';"
su-exec postgres psql -tc "SELECT 1 FROM pg_database WHERE datname = '$POSTGRES_DB'" | grep -q 1 || \
    su-exec postgres psql -c "CREATE DATABASE $POSTGRES_DB OWNER postgres;"

# Stop temporary daemons so Supervisord can manage process lifecycles
su-exec postgres pg_ctl -D /var/lib/postgresql/data stop
redis-cli -a "$REDIS_PASSWORD" shutdown

echo "==> Starting application stack under Supervisord..."
exec /usr/bin/supervisord -c /etc/supervisor/conf.d/supervisord.conf