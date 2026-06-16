import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getAuthUser } from '@/lib/auth-helper';

// PUT /api/subscriptions/[id] - Update a plan (super_admin only)
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const authResult = await getAuthUser();
    if (!authResult || authResult.user.role !== 'super_admin') {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 403 });
    }

    const { id } = await params;
    const data = await request.json();

    const plan = await db.subscriptionPlan.update({
      where: { id },
      data: {
        name: data.name,
        nameEn: data.nameEn,
        description: data.description,
        price: data.price,
        yearlyPrice: data.yearlyPrice,
        features: data.features ? (typeof data.features === 'string' ? data.features : JSON.stringify(data.features)) : undefined,
        modules: data.modules ? (typeof data.modules === 'string' ? data.modules : JSON.stringify(data.modules)) : undefined,
        maxPatients: data.maxPatients,
        maxDoctors: data.maxDoctors,
        maxClinics: data.maxClinics,
        isActive: data.isActive,
        isPopular: data.isPopular,
        sortOrder: data.sortOrder,
      },
    });

    return NextResponse.json(plan);
  } catch (error) {
    console.error('Subscription PUT error:', error);
    return NextResponse.json({ error: 'خطأ في الخادم' }, { status: 500 });
  }
}

// DELETE /api/subscriptions/[id] - Delete a plan (super_admin only)
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const authResult = await getAuthUser();
    if (!authResult || authResult.user.role !== 'super_admin') {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 403 });
    }

    const { id } = await params;

    // Check if plan has active subscriptions
    const subCount = await db.clinicSubscription.count({ where: { planId: id, status: 'active' } });
    if (subCount > 0) {
      return NextResponse.json({ error: 'لا يمكن حذف خطة بها اشتراكات نشطة' }, { status: 400 });
    }

    await db.subscriptionPlan.delete({ where: { id } });
    return NextResponse.json({ message: 'تم حذف الخطة بنجاح' });
  } catch (error) {
    console.error('Subscription DELETE error:', error);
    return NextResponse.json({ error: 'خطأ في الخادم' }, { status: 500 });
  }
}
