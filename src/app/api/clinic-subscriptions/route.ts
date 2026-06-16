import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getAuthUser } from '@/lib/auth-helper';

// GET /api/clinic-subscriptions - List clinic subscriptions
export async function GET() {
  try {
    const authResult = await getAuthUser();
    if (!authResult) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });

    let where = {};
    if (authResult.user.role !== 'super_admin') {
      where = { clinicId: authResult.currentClinicId || authResult.user.clinicId };
    }

    const subscriptions = await db.clinicSubscription.findMany({
      where,
      include: {
        clinic: { select: { id: true, name: true } },
        plan: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(subscriptions);
  } catch (error) {
    console.error('ClinicSubscriptions GET error:', error);
    return NextResponse.json({ error: 'خطأ في الخادم' }, { status: 500 });
  }
}

// POST /api/clinic-subscriptions - Grant subscription to clinic (super_admin only)
export async function POST(request: NextRequest) {
  try {
    const authResult = await getAuthUser();
    if (!authResult || authResult.user.role !== 'super_admin') {
      return NextResponse.json({ error: 'غير مصرح - يتطلب صلاحية المالك' }, { status: 403 });
    }

    const data = await request.json();
    if (!data.clinicId || !data.planId) {
      return NextResponse.json({ error: 'معرف العيادة والخطة مطلوبان' }, { status: 400 });
    }

    // Check if clinic already has an active subscription
    const existing = await db.clinicSubscription.findUnique({
      where: { clinicId: data.clinicId },
    });

    if (existing && existing.status === 'active') {
      return NextResponse.json({ error: 'العيادة لديها اشتراك نشط بالفعل' }, { status: 400 });
    }

    // If expired/cancelled, update it; otherwise create new
    let subscription;
    const allowedModulesValue = data.allowedModules
      ? (typeof data.allowedModules === 'string' ? data.allowedModules : JSON.stringify(data.allowedModules))
      : null;

    // billingCycle: 'monthly' (default) or 'yearly'
    const billingCycle = data.billingCycle === 'yearly' ? 'yearly' : 'monthly';

    if (existing) {
      subscription = await db.clinicSubscription.update({
        where: { id: existing.id },
        data: {
          planId: data.planId,
          status: 'active',
          billingCycle,
          startDate: new Date(),
          endDate: data.endDate ? new Date(data.endDate) : null,
          trialEndDate: data.trialEndDate ? new Date(data.trialEndDate) : null,
          allowedModules: allowedModulesValue,
          grantedBy: authResult.user.id,
          notes: data.notes,
          autoRenew: data.autoRenew ?? false,
        },
        include: { clinic: { select: { id: true, name: true } }, plan: true },
      });
    } else {
      subscription = await db.clinicSubscription.create({
        data: {
          clinicId: data.clinicId,
          planId: data.planId,
          status: data.status || 'active',
          billingCycle,
          startDate: new Date(),
          endDate: data.endDate ? new Date(data.endDate) : null,
          trialEndDate: data.trialEndDate ? new Date(data.trialEndDate) : null,
          allowedModules: allowedModulesValue,
          grantedBy: authResult.user.id,
          notes: data.notes,
          autoRenew: data.autoRenew ?? false,
        },
        include: { clinic: { select: { id: true, name: true } }, plan: true },
      });
    }

    return NextResponse.json(subscription, { status: 201 });
  } catch (error) {
    console.error('ClinicSubscriptions POST error:', error);
    return NextResponse.json({ error: 'خطأ في الخادم' }, { status: 500 });
  }
}
