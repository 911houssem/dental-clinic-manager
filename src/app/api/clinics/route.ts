import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getAuthUser } from '@/lib/auth-helper';

export async function GET() {
  try {
    const authResult = await getAuthUser();
    if (!authResult) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });

    const clinics = authResult.user.role === 'super_admin'
      ? await db.clinic.findMany({ include: { users: true, _count: { select: { patients: true, appointments: true, tasks: true } } }, orderBy: { createdAt: 'desc' } })
      : await db.clinic.findMany({ where: { id: authResult.currentClinicId || undefined }, include: { users: true, _count: { select: { patients: true, appointments: true, tasks: true } } } });

    return NextResponse.json(clinics);
  } catch (error) {
    console.error('Clinics GET error:', error);
    return NextResponse.json({ error: 'خطأ في الخادم' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const authResult = await getAuthUser();
    if (!authResult || authResult.user.role !== 'super_admin') {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 403 });
    }

    const data = await request.json();
    
    // Generate booking slug from name if not provided
    let bookingSlug = data.bookingSlug || data.name
      .replace(/\s+/g, '-')
      .replace(/[^\u0600-\u06FFa-zA-Z0-9-]/g, '')
      .toLowerCase();
    
    // Make slug unique
    const existing = await db.clinic.findUnique({ where: { bookingSlug } });
    if (existing) {
      bookingSlug = `${bookingSlug}-${Date.now().toString().slice(-4)}`;
    }

    const clinic = await db.clinic.create({
      data: {
        name: data.name,
        phone: data.phone,
        address: data.address,
        taxNumber: data.taxNumber,
        currency: data.currency || 'SAR',
        paymentMode: data.paymentMode || 'partial',
        slotDuration: data.slotDuration || 15,
        notes: data.notes,
        bookingSlug,
        bookingEnabled: data.bookingEnabled || false,
      },
    });

    // Create admin user for clinic if provided
    if (data.adminUsername && data.adminPassword) {
      const { hashPassword } = await import('@/lib/security');
      await db.user.create({
        data: {
          username: data.adminUsername,
          passwordHash: await hashPassword(data.adminPassword),
          fullName: data.adminFullName || 'مدير العيادة',
          role: 'admin',
          phone: data.adminPhone,
          clinicId: clinic.id,
          permissions: JSON.stringify({
            dashboard: true, patients: true, appointments: true,
            records: true, invoices: true, inventory: true,
            reports: true, settings: true,
          }),
          isActive: true,
        },
      });
    }

    return NextResponse.json(clinic);
  } catch (error) {
    console.error('Clinic POST error:', error);
    return NextResponse.json({ error: 'خطأ في الخادم' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const authResult = await getAuthUser();
    if (!authResult) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });

    const data = await request.json();

    // Admin can only update their own clinic
    if (authResult.user.role === 'admin') {
      if (data.id !== authResult.currentClinicId && data.id !== authResult.user.clinicId) {
        return NextResponse.json({ error: 'لا يمكنك تعديل عيادة أخرى' }, { status: 403 });
      }
    }

    const updateData: any = {
      name: data.name,
      phone: data.phone,
      address: data.address,
      taxNumber: data.taxNumber,
      currency: data.currency,
      paymentMode: data.paymentMode,
      slotDuration: data.slotDuration,
      notes: data.notes,
      isActive: data.isActive,
    };

    if (data.bookingEnabled !== undefined) updateData.bookingEnabled = data.bookingEnabled;
    if (data.bookingSlug !== undefined) updateData.bookingSlug = data.bookingSlug;

    const clinic = await db.clinic.update({
      where: { id: data.id },
      data: updateData,
    });

    return NextResponse.json(clinic);
  } catch (error) {
    console.error('Clinic PUT error:', error);
    return NextResponse.json({ error: 'خطأ في الخادم' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const authResult = await getAuthUser();
    if (!authResult || authResult.user.role !== 'super_admin') {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 403 });
    }

    const { id } = await request.json();
    await db.clinic.delete({ where: { id } });
    return NextResponse.json({ message: 'تم حذف العيادة' });
  } catch (error) {
    console.error('Clinic DELETE error:', error);
    return NextResponse.json({ error: 'خطأ في الخادم' }, { status: 500 });
  }
}
