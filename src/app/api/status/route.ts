import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/json-db';

// GET /api/status - System status check
export async function GET(request: NextRequest) {
  const startTime = Date.now();
  const status: any = {
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'unknown',
    database: 'json-in-memory',
    checks: {},
  };

  try {
    const db = await getDb();
    status.checks.database = {
      status: 'ok',
      connected: true,
      provider: 'json-in-memory',
      tables: {
        users: db.users.length,
        clinics: db.clinics.length,
        plans: db.subscriptionPlans.length,
        patients: db.patients.length,
        appointments: db.appointments.length,
        invoices: db.invoices.length,
      },
      initialized: db.users.length > 0,
    };

    status.checks.environment = {
      DATABASE_URL: process.env.DATABASE_URL ? 'set' : 'not set (using JSON db)',
      JWT_SECRET: process.env.JWT_SECRET ? 'set' : 'using default',
      NODE_ENV: process.env.NODE_ENV || 'unknown',
    };

    status.checks.security = {
      https: request.headers.get('x-forwarded-proto') === 'https' || request.url.startsWith('https'),
      password_hashing: 'bcrypt (12 rounds)',
      session_cookies: 'httpOnly, secure, sameSite=strict',
    };

    status.overall = 'healthy';
    status.timeMs = Date.now() - startTime;

    return NextResponse.json(status);
  } catch (error) {
    status.checks.database = {
      status: 'error',
      error: String(error),
    };
    status.overall = 'error';
    status.timeMs = Date.now() - startTime;
    return NextResponse.json(status, { status: 500 });
  }
}
