import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getAuthUser } from '@/lib/auth-helper';

// PUT /api/clinic-subscriptions/[id] - Update subscription (revoke/extend)
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const authResult = await getAuthUser();
    if (!authResult || authResult.user.role !== 'super_admin') {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 403 });
    }

    const { id } = await params;
    const data = await request.json();

    const updateData: any = {};
    if (data.status) updateData.status = data.status;
    if (data.endDate) updateData.endDate = new Date(data.endDate);
    if (data.notes !== undefined) updateData.notes = data.notes;
    if (data.autoRenew !== undefined) updateData.autoRenew = data.autoRenew;
    if (data.planId) updateData.planId = data.planId;

    const subscription = await db.clinicSubscription.update({
      where: { id },
      data: updateData,
      include: { clinic: { select: { id: true, name: true } }, plan: true },
    });

    return NextResponse.json(subscription);
  } catch (error) {
    console.error('ClinicSubscription PUT error:', error);
    return NextResponse.json({ error: 'خطأ في الخادم' }, { status: 500 });
  }
}

// DELETE /api/clinic-subscriptions/[id] - Revoke subscription
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const authResult = await getAuthUser();
    if (!authResult || authResult.user.role !== 'super_admin') {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 403 });
    }

    const { id } = await params;

    await db.clinicSubscription.update({
      where: { id },
      data: { status: 'cancelled' },
    });

    return NextResponse.json({ message: 'تم إلغاء الاشتراك' });
  } catch (error) {
    console.error('ClinicSubscription DELETE error:', error);
    return NextResponse.json({ error: 'خطأ في الخادم' }, { status: 500 });
  }
}
