FROM node:22-alpine

RUN apk add --no-cache libc6-compat openssl
WORKDIR /app

COPY package.json ./
RUN npm install --legacy-peer-deps && npm cache clean --force

COPY . .

ENV DATABASE_URL="file:/app/db/custom.db"
ENV NODE_OPTIONS="--max-old-space-size=512"

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

COPY start.sh /app/.next/standalone/start.sh

ENV NODE_ENV=production
ENV PORT=7860
ENV HOSTNAME="0.0.0.0"
ENV DATABASE_URL="file:/data/custom.db"

RUN chmod +x /app/.next/standalone/start.sh && \
    mkdir -p /data && chmod 777 /data

WORKDIR /app/.next/standalone
EXPOSE 7860
CMD ["sh", "./start.sh"]
