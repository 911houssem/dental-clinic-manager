import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getAuthUser } from '@/lib/auth-helper';

// GET /api/subscriptions - List all subscription plans
export async function GET() {
  try {
    const authResult = await getAuthUser();
    if (!authResult) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });

    const plans = await db.subscriptionPlan.findMany({
      orderBy: { sortOrder: 'asc' },
      include: { _count: { select: { subscriptions: true, offers: true } } },
    });

    return NextResponse.json(plans);
  } catch (error) {
    console.error('Subscriptions GET error:', error);
    return NextResponse.json({ error: 'خطأ في الخادم' }, { status: 500 });
  }
}

// POST /api/subscriptions - Create a new plan (super_admin only)
export async function POST(request: NextRequest) {
  try {
    const authResult = await getAuthUser();
    if (!authResult || authResult.user.role !== 'super_admin') {
      return NextResponse.json({ error: 'غير مصرح - يتطلب صلاحية المالك' }, { status: 403 });
    }

    const data = await request.json();
    if (!data.name || !data.features) {
      return NextResponse.json({ error: 'اسم الخطة والمميزات مطلوبة' }, { status: 400 });
    }

    const plan = await db.subscriptionPlan.create({
      data: {
        name: data.name,
        nameEn: data.nameEn,
        description: data.description,
        price: data.price ?? 0,
        yearlyPrice: data.yearlyPrice,
        features: typeof data.features === 'string' ? data.features : JSON.stringify(data.features),
        maxPatients: data.maxPatients,
        maxDoctors: data.maxDoctors,
        maxClinics: data.maxClinics,
        isActive: data.isActive ?? true,
        isPopular: data.isPopular ?? false,
        sortOrder: data.sortOrder ?? 0,
      },
    });

    return NextResponse.json(plan, { status: 201 });
  } catch (error) {
    console.error('Subscriptions POST error:', error);
    return NextResponse.json({ error: 'خطأ في الخادم' }, { status: 500 });
  }
}
