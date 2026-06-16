#!/bin/sh
set -e

echo "=== Dental Clinic Manager Starting ==="
echo "WORKDIR: $(pwd)"
echo "DATABASE_URL: $DATABASE_URL"

# STEP 1: Initialize the database in persistent storage if missing
if [ ! -f /data/custom.db ]; then
  echo "Initializing database in persistent storage..."
  if [ -f ./db/template.db ]; then
    cp ./db/template.db /data/custom.db
    echo "Database initialized from ./db/template.db!"
  elif [ -f /app/db/custom.db ]; then
    cp /app/db/custom.db /data/custom.db
    echo "Database initialized from /app/db/custom.db!"
  else
    echo "ERROR: No template database found!"
    ls -la ./db/ 2>/dev/null || echo "No ./db/ directory"
    ls -la /app/db/ 2>/dev/null || echo "No /app/db/ directory"
    exit 1
  fi
else
  echo "Database found in persistent storage"
fi

DB_SIZE=$(wc -c < /data/custom.db 2>/dev/null || echo "0")
echo "Database file size: ${DB_SIZE} bytes"

# STEP 1.5: Apply any pending schema migrations to the persistent DB
# (needed when the schema was updated after the initial deployment)
echo "=== Syncing database schema ==="
npx prisma db push --skip-generate 2>&1 || echo "Schema sync warning (continuing)"

# STEP 2: Start Next.js server in background, then call /api/seed
# This ensures the super_admin (admin/admin123) account always exists.
echo "=== Starting Next.js Server ==="
node server.js &
SERVER_PID=$!

# Wait for server to be ready
echo "Waiting for server to be ready..."
MAX_WAIT=60
WAITED=0
while [ $WAITED -lt $MAX_WAIT ]; do
  if curl -s -o /dev/null -w "%{http_code}" http://localhost:7860/api/subscriptions 2>/dev/null | grep -qE "^(200|401)$"; then
    echo "Server is ready after ${WAITED}s"
    break
  fi
  sleep 2
  WAITED=$((WAITED + 2))
done

# STEP 3: Ensure super_admin account exists via the seed endpoint
echo "=== Ensuring super_admin account exists ==="
SEED_RESPONSE=$(curl -s -X POST http://localhost:7860/api/seed 2>&1 || echo "curl failed")
echo "Seed response: $SEED_RESPONSE"

echo "=== Startup complete ==="

# Wait for the server process (so the container stays alive)
wait $SERVER_PID
