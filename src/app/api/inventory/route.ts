import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getAuthUser } from '@/lib/auth-helper';

export async function GET(request: NextRequest) {
  try {
    const authResult = await getAuthUser();
    if (!authResult) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const itemType = searchParams.get('itemType') || '';
    const clinicId = authResult.user.role === 'super_admin'
      ? searchParams.get('clinicId') || undefined
      : authResult.currentClinicId || undefined;

    const where: any = {};
    if (clinicId) where.clinicId = clinicId;
    if (itemType) where.itemType = itemType;
    if (search) where.itemName = { contains: search };

    const items = await db.inventoryItem.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(items);
  } catch (error) {
    console.error('Inventory GET error:', error);
    return NextResponse.json({ error: 'خطأ في الخادم' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const authResult = await getAuthUser();
    if (!authResult) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });

    const data = await request.json();
    const clinicId = authResult.user.role === 'super_admin'
      ? data.clinicId || (await db.clinic.findFirst())?.id
      : authResult.currentClinicId;

    const item = await db.inventoryItem.create({
      data: {
        itemName: data.itemName,
        itemType: data.itemType || 'medication',
        category: data.category,
        quantity: data.quantity || 0,
        minQuantity: data.minQuantity || 5,
        unit: data.unit,
        purchasePrice: data.purchasePrice || 0,
        sellingPrice: data.sellingPrice || 0,
        batchNumber: data.batchNumber,
        expiryDate: data.expiryDate,
        supplier: data.supplier,
        clinicId: clinicId,
        notes: data.notes,
      },
    });

    return NextResponse.json(item);
  } catch (error) {
    console.error('Inventory POST error:', error);
    return NextResponse.json({ error: 'خطأ في الخادم' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const authResult = await getAuthUser();
    if (!authResult) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });

    const data = await request.json();
    const item = await db.inventoryItem.update({
      where: { id: data.id },
      data: {
        itemName: data.itemName,
        itemType: data.itemType,
        category: data.category,
        quantity: data.quantity,
        minQuantity: data.minQuantity,
        unit: data.unit,
        purchasePrice: data.purchasePrice,
        sellingPrice: data.sellingPrice,
        batchNumber: data.batchNumber,
        expiryDate: data.expiryDate,
        supplier: data.supplier,
        notes: data.notes,
      },
    });

    return NextResponse.json(item);
  } catch (error) {
    console.error('Inventory PUT error:', error);
    return NextResponse.json({ error: 'خطأ في الخادم' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const authResult = await getAuthUser();
    if (!authResult) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });

    const { id } = await request.json();
    await db.inventoryItem.delete({ where: { id } });
    return NextResponse.json({ message: 'تم حذف الصنف' });
  } catch (error) {
    console.error('Inventory DELETE error:', error);
    return NextResponse.json({ error: 'خطأ في الخادم' }, { status: 500 });
  }
}
