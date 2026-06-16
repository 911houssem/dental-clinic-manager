import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getAuthUser } from '@/lib/auth-helper';

// GET /api/offers - List offers (with ?active=true for landing page)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const activeOnly = searchParams.get('active') === 'true';

    const where: any = {};
    if (activeOnly) {
      where.isActive = true;
      where.showOnLanding = true;
      const now = new Date();
      where.OR = [
        { startDate: null, endDate: null },
        { startDate: { lte: now }, endDate: { gte: now } },
        { startDate: null, endDate: { gte: now } },
        { startDate: { lte: now }, endDate: null },
      ];
    }

    const offers = await db.offer.findMany({
      where,
      include: { plan: { select: { id: true, name: true, price: true } } },
      orderBy: { sortOrder: 'asc' },
    });

    return NextResponse.json(offers);
  } catch (error) {
    console.error('Offers GET error:', error);
    return NextResponse.json({ error: 'خطأ في الخادم' }, { status: 500 });
  }
}

// POST /api/offers - Create offer (super_admin only)
export async function POST(request: NextRequest) {
  try {
    const authResult = await getAuthUser();
    if (!authResult || authResult.user.role !== 'super_admin') {
      return NextResponse.json({ error: 'غير مصرح - يتطلب صلاحية المالك' }, { status: 403 });
    }

    const data = await request.json();
    if (!data.title) {
      return NextResponse.json({ error: 'عنوان العرض مطلوب' }, { status: 400 });
    }

    const offer = await db.offer.create({
      data: {
        title: data.title,
        description: data.description,
        discountType: data.discountType || 'percentage',
        discountValue: data.discountValue ?? 0,
        planId: data.planId,
        startDate: data.startDate ? new Date(data.startDate) : null,
        endDate: data.endDate ? new Date(data.endDate) : null,
        isActive: data.isActive ?? true,
        showOnLanding: data.showOnLanding ?? true,
        badge: data.badge,
        sortOrder: data.sortOrder ?? 0,
      },
      include: { plan: { select: { id: true, name: true, price: true } } },
    });

    return NextResponse.json(offer, { status: 201 });
  } catch (error) {
    console.error('Offers POST error:', error);
    return NextResponse.json({ error: 'خطأ في الخادم' }, { status: 500 });
  }
}
