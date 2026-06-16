import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getAuthUser } from '@/lib/auth-helper';

export async function GET() {
  try {
    const authResult = await getAuthUser();
    if (!authResult) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });

    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    const logs = await db.auditLog.findMany({
      where: { createdAt: { gte: sevenDaysAgo } },
      orderBy: { createdAt: 'desc' },
      take: 200,
    });

    return NextResponse.json(logs);
  } catch (error) {
    console.error('Audit GET error:', error);
    return NextResponse.json({ error: 'خطأ في الخادم' }, { status: 500 });
  }
}
