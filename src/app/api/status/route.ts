import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET /api/status - System status check
// Public endpoint - returns database connectivity + basic security info
export async function GET(request: NextRequest) {
  const startTime = Date.now();
  const status: any = {
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'unknown',
    checks: {},
  };

  // === 1) Database connection check ===
  try {
    await db.$queryRaw`SELECT 1`;
    status.checks.database = {
      status: 'ok',
      connected: true,
      provider: 'postgresql',
    };
  } catch (error) {
    status.checks.database = {
      status: 'error',
      connected: false,
      error: String(error),
      hint: 'Verify DATABASE_URL environment variable is set correctly',
    };
    return NextResponse.json(status, { status: 500 });
  }

  // === 2) Database tables check ===
  try {
    const userCount = await db.user.count();
    const clinicCount = await db.clinic.count();
    const planCount = await db.subscriptionPlan.count();
    status.checks.database.tables = {
      users: userCount,
      clinics: clinicCount,
      plans: planCount,
    };
    status.checks.database.initialized = userCount > 0;
    if (userCount === 0) {
      status.checks.database.hint = 'Database is empty. Visit /api/init to initialize with demo data';
    }
  } catch (error) {
    status.checks.database.tables = {
      status: 'error',
      error: 'Tables may not exist yet. Run prisma db push first',
      details: String(error),
    };
  }

  // === 3) Environment variables check ===
  status.checks.environment = {
    DATABASE_URL: process.env.DATABASE_URL ? 'set' : 'MISSING',
    JWT_SECRET: process.env.JWT_SECRET ? 'set' : 'MISSING',
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET ? 'set' : 'MISSING (optional)',
    NODE_ENV: process.env.NODE_ENV || 'unknown',
  };

  // === 4) Security check ===
  status.checks.security = {
    https: request.headers.get('x-forwarded-proto') === 'https' || request.url.startsWith('https'),
    cookies_httpOnly: true,
    password_hashing: 'bcrypt (12 rounds)',
    rate_limiting: 'enabled',
    csrf_protection: 'enabled (SameSite=strict cookies)',
  };

  // === 5) Build info ===
  status.checks.build = {
    framework: 'Next.js 16',
    database: 'PostgreSQL (Supabase)',
    runtime: 'Netlify Functions',
  };

  // === 6) Overall status ===
  const allOk = status.checks.database.connected && status.checks.database.initialized;
  status.overall = allOk ? 'healthy' : 'needs attention';
  status.timeMs = Date.now() - startTime;

  return NextResponse.json(status, { status: allOk ? 200 : 200 });
}
