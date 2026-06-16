import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getAuthUser } from '@/lib/auth-helper';

// PUT /api/offers/[id] - Update offer
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const authResult = await getAuthUser();
    if (!authResult || authResult.user.role !== 'super_admin') {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 403 });
    }

    const { id } = await params;
    const data = await request.json();

    const updateData: any = {};
    if (data.title) updateData.title = data.title;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.discountType) updateData.discountType = data.discountType;
    if (data.discountValue !== undefined) updateData.discountValue = data.discountValue;
    if (data.planId !== undefined) updateData.planId = data.planId || null;
    if (data.startDate !== undefined) updateData.startDate = data.startDate ? new Date(data.startDate) : null;
    if (data.endDate !== undefined) updateData.endDate = data.endDate ? new Date(data.endDate) : null;
    if (data.isActive !== undefined) updateData.isActive = data.isActive;
    if (data.showOnLanding !== undefined) updateData.showOnLanding = data.showOnLanding;
    if (data.badge !== undefined) updateData.badge = data.badge;
    if (data.sortOrder !== undefined) updateData.sortOrder = data.sortOrder;

    const offer = await db.offer.update({
      where: { id },
      data: updateData,
      include: { plan: { select: { id: true, name: true, price: true } } },
    });

    return NextResponse.json(offer);
  } catch (error) {
    console.error('Offer PUT error:', error);
    return NextResponse.json({ error: 'خطأ في الخادم' }, { status: 500 });
  }
}

// DELETE /api/offers/[id] - Delete offer
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const authResult = await getAuthUser();
    if (!authResult || authResult.user.role !== 'super_admin') {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 403 });
    }

    const { id } = await params;
    await db.offer.delete({ where: { id } });
    return NextResponse.json({ message: 'تم حذف العرض' });
  } catch (error) {
    console.error('Offer DELETE error:', error);
    return NextResponse.json({ error: 'خطأ في الخادم' }, { status: 500 });
  }
}
