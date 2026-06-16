import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth-helper';
import { db } from '@/lib/db';

// GET: Get security config
export async function GET() {
  try {
    const authResult = await getAuthUser();
    if (!authResult || authResult.user.role !== 'super_admin') {
      return NextResponse.json({ error: 'غير مصرح - مطلوب صلاحية المالك' }, { status: 403 });
    }

    let config = await db.securityConfig.findFirst({
      where: { clinicId: authResult.currentClinicId },
    });

    if (!config) {
      config = await db.securityConfig.create({
        data: { clinicId: authResult.currentClinicId },
      });
    }

    return NextResponse.json({ config });
  } catch (error) {
    console.error('Security config error:', error);
    return NextResponse.json({ error: 'حدث خطأ في الخادم' }, { status: 500 });
  }
}

// PUT: Update security config
export async function PUT(request: NextRequest) {
  try {
    const authResult = await getAuthUser();
    if (!authResult || authResult.user.role !== 'super_admin') {
      return NextResponse.json({ error: 'غير مصرح - مطلوب صلاحية المالك' }, { status: 403 });
    }

    const data = await request.json();

    const config = await db.securityConfig.upsert({
      where: { clinicId: authResult.currentClinicId || 'default' },
      create: {
        clinicId: authResult.currentClinicId,
        ...data,
      },
      update: data,
    });

    await db.securityLog.create({
      data: {
        userId: authResult.user.id,
        action: 'security_config_updated',
        severity: 'warning',
        details: 'تم تحديث إعدادات الأمان',
        ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
      },
    });

    return NextResponse.json({ config });
  } catch (error) {
    console.error('Security config update error:', error);
    return NextResponse.json({ error: 'حدث خطأ في الخادم' }, { status: 500 });
  }
}
