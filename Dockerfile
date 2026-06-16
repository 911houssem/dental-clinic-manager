FROM node:22-alpine

RUN apk add --no-cache libc6-compat openssl

WORKDIR /app

# Copy package files first for caching
COPY package.json ./
COPY prisma ./prisma/

# Install dependencies
RUN npm install --legacy-peer-deps && npm cache clean --force

# Copy source code
COPY . .

# Use absolute path for DATABASE_URL — Prisma SQLite relative paths
# resolve relative to the schema file location, NOT the working directory.
ENV DATABASE_URL="file:/app/db/custom.db"
ENV NODE_OPTIONS="--max-old-space-size=512"

# Single RUN layer to avoid Docker layer isolation issues with SQLite:
# 1. Generate Prisma client
# 2. Create DB and push schema
# 3. Build Next.js (standalone output)
# 4. Copy standalone + static + public + prisma into standalone
# 5. Copy Prisma client binaries
# 6. Save a template DB for first-time initialization on HF Spaces
# 7. Clean caches to reduce image size
RUN npx prisma generate && \
    mkdir -p /app/db && \
    npx prisma db push --skip-generate && \
    ls -la /app/db/custom.db && \
    npm run build && \
    cp -r .next/static .next/standalone/.next/ && \
    cp -r public .next/standalone/ && \
    cp -r prisma .next/standalone/ && \
    mkdir -p .next/standalone/node_modules/.prisma/client && \
    cp -r node_modules/.prisma/client/* .next/standalone/node_modules/.prisma/client/ && \
    mkdir -p .next/standalone/node_modules/@prisma/client && \
    cp -r node_modules/@prisma/client/* .next/standalone/node_modules/@prisma/client/ && \
    mkdir -p .next/standalone/db && \
    cp /app/db/custom.db .next/standalone/db/template.db && \
    rm -rf .next/cache && \
    echo "Build complete! Template DB size: $(wc -c < .next/standalone/db/template.db) bytes"

# Copy startup script
COPY start.sh /app/.next/standalone/start.sh

ENV NODE_ENV=production
ENV PORT=7860
ENV HOSTNAME="0.0.0.0"
# Persistent storage on HF Spaces lives in /data
ENV DATABASE_URL="file:/data/custom.db"

RUN chmod +x /app/.next/standalone/start.sh && \
    mkdir -p /data && chmod 777 /data

WORKDIR /app/.next/standalone
EXPOSE 7860

CMD ["sh", "./start.sh"]
