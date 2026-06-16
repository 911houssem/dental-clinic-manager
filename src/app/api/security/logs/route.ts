import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth-helper';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const authResult = await getAuthUser();
    if (!authResult) {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });
    }

    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '50');
    const severity = url.searchParams.get('severity');
    const action = url.searchParams.get('action');

    const where: any = { userId: authResult.user.id };
    if (severity) where.severity = severity;
    if (action) where.action = action;

    const [logs, total] = await Promise.all([
      db.securityLog.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      db.securityLog.count({ where }),
    ]);

    // Also get trusted devices
    const trustedDevices = await db.trustedDevice.findMany({
      where: { userId: authResult.user.id },
      orderBy: { lastUsedAt: 'desc' },
    });

    // Get security config
    let config = await db.securityConfig.findFirst({
      where: { clinicId: authResult.currentClinicId },
    });

    if (!config) {
      // Create default config
      config = await db.securityConfig.create({
        data: { clinicId: authResult.currentClinicId },
      });
    }

    // Get login attempts stats
    const recentLogins = await db.loginAttempt.findMany({
      where: { userId: authResult.user.id },
      orderBy: { createdAt: 'desc' },
      take: 10,
    });

    return NextResponse.json({
      logs,
      total,
      page,
      totalPages: Math.ceil(total / limit),
      trustedDevices,
      config,
      recentLogins,
    });
  } catch (error) {
    console.error('Security logs error:', error);
    return NextResponse.json({ error: 'حدث خطأ في الخادم' }, { status: 500 });
  }
}

// DELETE: Remove a trusted device
export async function DELETE(request: NextRequest) {
  try {
    const authResult = await getAuthUser();
    if (!authResult) {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });
    }

    const { deviceId } = await request.json();
    if (!deviceId) {
      return NextResponse.json({ error: 'معرف الجهاز مطلوب' }, { status: 400 });
    }

    await db.trustedDevice.deleteMany({
      where: { id: deviceId, userId: authResult.user.id },
    });

    await db.securityLog.create({
      data: {
        userId: authResult.user.id,
        action: 'device_revoked',
        severity: 'warning',
        details: 'تم إزالة جهاز موثوق',
        ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
      },
    });

    return NextResponse.json({ message: 'تم إزالة الجهاز الموثوق' });
  } catch (error) {
    console.error('Device revoke error:', error);
    return NextResponse.json({ error: 'حدث خطأ في الخادم' }, { status: 500 });
  }
}
