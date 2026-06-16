import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getAuthUser } from '@/lib/auth-helper';

export async function GET(request: NextRequest) {
  try {
    const authResult = await getAuthUser();
    if (!authResult) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const patientId = searchParams.get('patientId');

    if (!patientId) {
      return NextResponse.json({ error: 'معرف المريض مطلوب' }, { status: 400 });
    }

    const records = await db.medicalRecord.findMany({
      where: { patientId },
      include: {
        doctor: { select: { id: true, fullName: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(records);
  } catch (error) {
    console.error('Records GET error:', error);
    return NextResponse.json({ error: 'خطأ في الخادم' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const authResult = await getAuthUser();
    if (!authResult) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });

    const data = await request.json();
    const record = await db.medicalRecord.create({
      data: {
        patientId: data.patientId,
        doctorId: data.doctorId || authResult.user.id,
        chiefComplaint: data.chiefComplaint,
        historyOfPresentIllness: data.historyOfPresentIllness,
        diagnosis: data.diagnosis,
        diagnosisCode: data.diagnosisCode,
        treatmentPlan: data.treatmentPlan,
        followUpDate: data.followUpDate,
        notes: data.notes,
      },
    });

    return NextResponse.json(record);
  } catch (error) {
    console.error('Record POST error:', error);
    return NextResponse.json({ error: 'خطأ في الخادم' }, { status: 500 });
  }
}
