// Use JSON file-based storage (works on Vercel without external database)
// Falls back to Prisma only if DATABASE_URL is explicitly set

import { dbClient, hashPassword, verifyPassword, hashToken } from './json-db';

// Always use JSON database (no external DB needed)
export const db = dbClient;
export { hashPassword, verifyPassword, hashToken };
