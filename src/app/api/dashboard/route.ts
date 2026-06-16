import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getAuthUser } from '@/lib/auth-helper';

export async function GET(request: NextRequest) {
  try {
    const authResult = await getAuthUser();
    if (!authResult) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const clinicId = authResult.user.role === 'super_admin'
      ? searchParams.get('clinicId') || authResult.currentClinicId || (await db.clinic.findFirst())?.id
      : authResult.user.clinicId;

    if (!clinicId) {
      return NextResponse.json({ error: 'لم يتم اختيار عيادة' }, { status: 400 });
    }

    const today = new Date().toISOString().split('T')[0];

    const [todayAppointments, totalPatients, invoiceStats] = await Promise.all([
      db.appointment.findMany({
        where: { clinicId, startTime: { contains: today } },
        include: { patient: { select: { fullName: true, phone: true } }, doctor: { select: { fullName: true } } },
        orderBy: { startTime: 'asc' },
      }),
      db.patient.count({ where: { clinicId } }),
      db.invoice.aggregate({
        where: { clinicId },
        _sum: { total: true, paidAmount: true, dueAmount: true },
        _count: true,
      }),
    ]);

    // Revenue by day for chart (last 7 days)
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const recentInvoices = await db.invoice.findMany({
      where: { clinicId, createdAt: { gte: sevenDaysAgo } },
      select: { total: true, paidAmount: true, createdAt: true },
      orderBy: { createdAt: 'asc' },
    });

    const dayNames = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
    const revenueByDay = new Map();
    for (const inv of recentInvoices) {
      const d = new Date(inv.createdAt);
      const dayName = dayNames[d.getDay()];
      revenueByDay.set(dayName, (revenueByDay.get(dayName) || 0) + inv.total);
    }

    const revenueChart = dayNames.map(day => ({
      name: day,
      revenue: revenueByDay.get(day) || 0,
    }));

    return NextResponse.json({
      stats: {
        todayAppointments: todayAppointments.length,
        totalPatients,
        totalRevenue: invoiceStats._sum.total || 0,
        totalCollected: invoiceStats._sum.paidAmount || 0,
      },
      todayAppointments,
      revenueChart,
    });
  } catch (error) {
    console.error('Dashboard GET error:', error);
    return NextResponse.json({ error: 'خطأ في الخادم' }, { status: 500 });
  }
}
