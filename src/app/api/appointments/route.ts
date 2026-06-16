import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getAuthUser } from '@/lib/auth-helper';

export async function GET(request: NextRequest) {
  try {
    const authResult = await getAuthUser();
    if (!authResult) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date');
    const clinicId = authResult.user.role === 'super_admin'
      ? searchParams.get('clinicId') || undefined
      : authResult.currentClinicId || undefined;

    const where: any = {};
    if (clinicId) where.clinicId = clinicId;
    if (date) where.startTime = { contains: date };

    const appointments = await db.appointment.findMany({
      where,
      include: {
        patient: { select: { id: true, fullName: true, phone: true, fileNumber: true, gender: true, age: true } },
        doctor: { select: { id: true, fullName: true } },
      },
      orderBy: { startTime: 'asc' },
    });

    return NextResponse.json(appointments);
  } catch (error) {
    console.error('Appointments GET error:', error);
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

    const appointment = await db.appointment.create({
      data: {
        patientId: data.patientId,
        doctorId: data.doctorId,
        clinicId: clinicId,
        title: data.title,
        startTime: data.startTime,
        endTime: data.endTime,
        type: data.type || 'regular',
        status: data.status || 'scheduled',
        notes: data.notes,
        createdBy: authResult.user.id,
      },
      include: {
        patient: { select: { fullName: true, phone: true } },
        doctor: { select: { fullName: true } },
      },
    });

    return NextResponse.json(appointment);
  } catch (error) {
    console.error('Appointment POST error:', error);
    return NextResponse.json({ error: 'خطأ في الخادم' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const authResult = await getAuthUser();
    if (!authResult) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });

    const data = await request.json();
    const appointment = await db.appointment.update({
      where: { id: data.id },
      data: {
        status: data.status,
        notes: data.notes,
        title: data.title,
        startTime: data.startTime,
        endTime: data.endTime,
        type: data.type,
      },
    });

    return NextResponse.json(appointment);
  } catch (error) {
    console.error('Appointment PUT error:', error);
    return NextResponse.json({ error: 'خطأ في الخادم' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const authResult = await getAuthUser();
    if (!authResult) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });

    const { id } = await request.json();
    await db.appointment.delete({ where: { id } });
    return NextResponse.json({ message: 'تم حذف الموعد' });
  } catch (error) {
    console.error('Appointment DELETE error:', error);
    return NextResponse.json({ error: 'خطأ في الخادم' }, { status: 500 });
  }
}
