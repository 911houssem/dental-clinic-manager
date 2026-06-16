import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getAuthUser } from '@/lib/auth-helper';

export async function GET(request: NextRequest) {
  try {
    const authResult = await getAuthUser();
    if (!authResult) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = 20;

    const clinicId = authResult.user.role === 'super_admin'
      ? searchParams.get('clinicId') || undefined
      : authResult.currentClinicId || undefined;

    const where: any = {};
    if (clinicId) where.clinicId = clinicId;
    if (search) {
      where.OR = [
        { fullName: { contains: search } },
        { phone: { contains: search } },
        { fileNumber: { contains: search } },
      ];
    }

    const [patients, total] = await Promise.all([
      db.patient.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      db.patient.count({ where }),
    ]);

    return NextResponse.json({ patients, total, page, pages: Math.ceil(total / limit) });
  } catch (error) {
    console.error('Patients GET error:', error);
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

    const patient = await db.patient.create({
      data: {
        fileNumber: `CL-${Date.now().toString().slice(-8)}`,
        fullName: data.fullName,
        phone: data.phone,
        phone2: data.phone2,
        email: data.email,
        gender: data.gender,
        birthDate: data.birthDate,
        age: data.age,
        address: data.address,
        bloodType: data.bloodType,
        maritalStatus: data.maritalStatus,
        occupation: data.occupation,
        nationalId: data.nationalId,
        emergencyContact: data.emergencyContact,
        emergencyPhone: data.emergencyPhone,
        allergies: data.allergies ? JSON.stringify(data.allergies) : null,
        chronicDiseases: data.chronicDiseases ? JSON.stringify(data.chronicDiseases) : null,
        clinicId: clinicId,
        notes: data.notes,
      },
    });

    return NextResponse.json(patient);
  } catch (error) {
    console.error('Patient POST error:', error);
    return NextResponse.json({ error: 'خطأ في الخادم' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const authResult = await getAuthUser();
    if (!authResult) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });

    const data = await request.json();
    const patient = await db.patient.update({
      where: { id: data.id },
      data: {
        fullName: data.fullName,
        phone: data.phone,
        phone2: data.phone2,
        email: data.email,
        gender: data.gender,
        birthDate: data.birthDate,
        age: data.age,
        address: data.address,
        bloodType: data.bloodType,
        maritalStatus: data.maritalStatus,
        occupation: data.occupation,
        nationalId: data.nationalId,
        emergencyContact: data.emergencyContact,
        emergencyPhone: data.emergencyPhone,
        allergies: data.allergies ? JSON.stringify(data.allergies) : undefined,
        chronicDiseases: data.chronicDiseases ? JSON.stringify(data.chronicDiseases) : undefined,
        notes: data.notes,
      },
    });

    return NextResponse.json(patient);
  } catch (error) {
    console.error('Patient PUT error:', error);
    return NextResponse.json({ error: 'خطأ في الخادم' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const authResult = await getAuthUser();
    if (!authResult) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });

    const { id } = await request.json();
    await db.patient.delete({ where: { id } });
    return NextResponse.json({ message: 'تم حذف المريض' });
  } catch (error) {
    console.error('Patient DELETE error:', error);
    return NextResponse.json({ error: 'خطأ في الخادم' }, { status: 500 });
  }
}
