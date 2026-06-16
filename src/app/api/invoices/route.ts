import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getAuthUser } from '@/lib/auth-helper';

export async function GET(request: NextRequest) {
  try {
    const authResult = await getAuthUser();
    if (!authResult) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const clinicId = authResult.user.role === 'super_admin'
      ? searchParams.get('clinicId') || undefined
      : authResult.currentClinicId || undefined;

    const where: any = {};
    if (clinicId) where.clinicId = clinicId;

    const invoices = await db.invoice.findMany({
      where,
      include: {
        patient: { select: { id: true, fullName: true, fileNumber: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Stats
    const stats = {
      totalRevenue: invoices.reduce((sum, inv) => sum + inv.total, 0),
      totalCollected: invoices.reduce((sum, inv) => sum + inv.paidAmount, 0),
      totalPending: invoices.reduce((sum, inv) => sum + inv.dueAmount, 0),
      totalInvoices: invoices.length,
    };

    return NextResponse.json({ invoices, stats });
  } catch (error) {
    console.error('Invoices GET error:', error);
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

    const subtotal = data.subtotal || 0;
    const taxPercentage = data.taxPercentage ?? 15;
    const insuranceDiscount = data.insuranceDiscount || 0;
    const taxAmount = (subtotal - insuranceDiscount) * (taxPercentage / 100);
    const total = subtotal - insuranceDiscount + taxAmount;

    const invoice = await db.invoice.create({
      data: {
        invoiceNumber: `INV-${new Date().toISOString().slice(0, 7).replace('-', '')}-${Date.now().toString().slice(-6)}`,
        patientId: data.patientId,
        clinicId: clinicId,
        subtotal,
        insuranceDiscount,
        taxPercentage,
        taxAmount,
        total,
        paidAmount: data.paidAmount || 0,
        dueAmount: total - (data.paidAmount || 0),
        status: data.status || 'pending',
        paymentMethod: data.paymentMethod,
        items: data.items ? JSON.stringify(data.items) : null,
        notes: data.notes,
        createdBy: authResult.user.id,
      },
    });

    return NextResponse.json(invoice);
  } catch (error) {
    console.error('Invoice POST error:', error);
    return NextResponse.json({ error: 'خطأ في الخادم' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const authResult = await getAuthUser();
    if (!authResult) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });

    const data = await request.json();
    const invoice = await db.invoice.update({
      where: { id: data.id },
      data: {
        status: data.status,
        paidAmount: data.paidAmount,
        dueAmount: data.dueAmount,
        paymentMethod: data.paymentMethod,
      },
    });

    return NextResponse.json(invoice);
  } catch (error) {
    console.error('Invoice PUT error:', error);
    return NextResponse.json({ error: 'خطأ في الخادم' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const authResult = await getAuthUser();
    if (!authResult) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });

    const { id } = await request.json();
    await db.invoice.delete({ where: { id } });
    return NextResponse.json({ message: 'تم حذف الفاتورة' });
  } catch (error) {
    console.error('Invoice DELETE error:', error);
    return NextResponse.json({ error: 'خطأ في الخادم' }, { status: 500 });
  }
}
