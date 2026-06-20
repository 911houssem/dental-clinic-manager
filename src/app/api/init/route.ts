import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/json-db';

// GET /api/init - Initialize database (auto-seeds on first call)
// Idempotent: safe to call multiple times
export async function GET(request: NextRequest) {
  const startTime = Date.now();
  try {
    const db = await getDb();

    return NextResponse.json({
      success: true,
      message: 'تم تهيئة قاعدة البيانات بنجاح',
      adminCredentials: {
        username: 'admin',
        password: 'admin123',
      },
      demoUsers: [
        { username: 'admin', password: 'admin123', role: 'المالك' },
        { username: 'doctor1', password: 'doctor123', role: 'طبيب' },
        { username: 'reception1', password: 'reception123', role: 'استقبال' },
      ],
      stats: {
        users: db.users.length,
        clinics: db.clinics.length,
        plans: db.subscriptionPlans.length,
        offers: db.offers.length,
        patients: db.patients.length,
        appointments: db.appointments.length,
        invoices: db.invoices.length,
        inventoryItems: db.inventoryItems.length,
      },
      timeMs: Date.now() - startTime,
    });
  } catch (error) {
    console.error('Init error:', error);
    return NextResponse.json({
      success: false,
      error: 'Init failed',
      details: String(error),
    }, { status: 500 });
  }
}
