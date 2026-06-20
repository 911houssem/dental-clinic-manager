// Use JSON file-based storage (works on Vercel without external database)
// Falls back to Prisma only if DATABASE_URL is explicitly set
const useJsonDb = !process.env.DATABASE_URL || process.env.USE_JSON_DB === 'true';

if (useJsonDb) {
  // Use JSON in-memory storage
  module.exports = require('./json-db');
} else {
  // Use Prisma with external database (Supabase, etc.)
  const { PrismaClient } = require('@prisma/client');

  const globalForPrisma = globalThis as unknown as {
    prisma: PrismaClient | undefined
  }

  const prisma = globalForPrisma.prisma ?? new PrismaClient({
    log: ['query'],
  })

  if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

  module.exports = { db: prisma };
}
