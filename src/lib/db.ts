// Use JSON file-based storage (works on Vercel without external database)
// Falls back to Prisma only if DATABASE_URL is explicitly set

const useJsonDb = !process.env.DATABASE_URL || process.env.USE_JSON_DB === 'true';

if (useJsonDb) {
  // Use JSON in-memory storage
  // We export the dbClient directly from json-db
  module.exports.db = require('./json-db').dbClient;
  module.exports.hashPassword = require('./json-db').hashPassword;
  module.exports.verifyPassword = require('./json-db').verifyPassword;
  module.exports.hashToken = require('./json-db').hashToken;
} else {
  // Use Prisma with external database (Supabase, etc.)
  const { PrismaClient } = require('@prisma/client');
  const globalForPrisma = globalThis as unknown as { prisma: any };
  const prisma = globalForPrisma.prisma ?? new PrismaClient({ log: ['query'] });
  if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
  module.exports.db = prisma;
}
