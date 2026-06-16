#!/bin/sh
set -e
echo "=== Dental Clinic Manager Starting ==="
echo "DATABASE_URL: $DATABASE_URL"

if [ ! -f /data/custom.db ]; then
  echo "Initializing database in persistent storage..."
  if [ -f ./db/template.db ]; then
    cp ./db/template.db /data/custom.db
    echo "Database initialized from template! Size: $(wc -c < /data/custom.db) bytes"
  else
    echo "ERROR: No template database found at ./db/template.db"
    exit 1
  fi
else
  echo "Database found in persistent storage ($(wc -c < /data/custom.db) bytes)"
fi

echo "=== Starting Next.js Server ==="
exec node server.js
