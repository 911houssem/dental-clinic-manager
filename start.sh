#!/bin/sh
set -e

echo "=== Dental Clinic Manager Starting ==="
echo "WORKDIR: $(pwd)"
echo "DATABASE_URL: $DATABASE_URL"
echo "Timestamp: $(date -u +%Y-%m-%dT%H:%M:%SZ)"

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

# STEP 2: Start Next.js server in background
echo "=== Starting Next.js Server ==="
node server.js &
SERVER_PID=$!

# Wait for server to be ready (extended timeout — HF Spaces can be slow on cold starts)
echo "Waiting for server to be ready..."
MAX_WAIT=120
WAITED=0
SERVER_READY=0
while [ $WAITED -lt $MAX_WAIT ]; do
  HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:7860/api/subscriptions 2>/dev/null || echo "000")
  if echo "$HTTP_CODE" | grep -qE "^(200|401)$"; then
    echo "Server is ready after ${WAITED}s (HTTP $HTTP_CODE)"
    SERVER_READY=1
    break
  fi
  # Log progress every 10s
  if [ $((WAITED % 10)) -eq 0 ] && [ $WAITED -gt 0 ]; then
    echo "  ...still waiting (${WAITED}s, last HTTP=$HTTP_CODE)"
  fi
  sleep 2
  WAITED=$((WAITED + 2))
done

if [ $SERVER_READY -eq 0 ]; then
  echo "WARNING: Server did not become ready within ${MAX_WAIT}s — attempting seed anyway"
fi

# STEP 3: Ensure super_admin account exists via the seed endpoint
# Retry up to 3 times in case the server is still warming up.
echo "=== Ensuring super_admin account exists ==="
SEED_MAX_RETRIES=3
SEED_RETRY_DELAY=5
SEED_SUCCESS=0

for ATTEMPT in $(seq 1 $SEED_MAX_RETRIES); do
  echo "--- Seed attempt ${ATTEMPT}/${SEED_MAX_RETRIES} ---"
  SEED_RESPONSE=$(curl -s -X POST --max-time 30 http://localhost:7860/api/seed 2>&1 || echo "curl_failed")
  echo "Seed response: $SEED_RESPONSE"

  # Check if response contains a success indicator
  if echo "$SEED_RESPONSE" | grep -qE "(تم ضمان وجود حساب المالك|تم تهيئة قاعدة البيانات بنجاح)"; then
    echo "Seed succeeded on attempt ${ATTEMPT}"
    SEED_SUCCESS=1
    break
  fi

  if [ $ATTEMPT -lt $SEED_MAX_RETRIES ]; then
    echo "Seed did not confirm success — retrying in ${SEED_RETRY_DELAY}s..."
    sleep $SEED_RETRY_DELAY
  fi
done

if [ $SEED_SUCCESS -eq 0 ]; then
  echo "WARNING: Seed endpoint did not confirm success after ${SEED_MAX_RETRIES} attempts"
  echo "The admin account may not exist. Manual intervention may be required."
fi

# STEP 4: Verify admin account works by attempting a login
echo "=== Verifying admin account (admin/admin123) ==="
LOGIN_RESPONSE=$(curl -s -X POST --max-time 10 http://localhost:7860/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}' 2>&1 || echo "curl_failed")

if echo "$LOGIN_RESPONSE" | grep -q '"username":"admin"'; then
  echo "✓ Admin account verified and working"
else
  echo "✗ WARNING: Admin login verification failed!"
  echo "  Login response: $LOGIN_RESPONSE"
  echo "  The super_admin account may need to be created manually via /api/seed"
fi

echo "=== Startup complete at $(date -u +%Y-%m-%dT%H:%M:%SZ) ==="

# Wait for the server process (so the container stays alive)
wait $SERVER_PID
