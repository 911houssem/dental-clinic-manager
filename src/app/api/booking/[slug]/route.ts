import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET /api/booking/[slug] - Get clinic public info for booking
export async function GET(request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await params;
    
    // Try to find by bookingSlug first, then by id (fallback)
    let clinic = await db.clinic.findUnique({
      where: { bookingSlug: slug },
      select: {
        id: true,
        name: true,
        phone: true,
        address: true,
        slotDuration: true,
        currency: true,
        bookingEnabled: true,
        isActive: true,
      },
    });

    // Fallback: try finding by clinic ID directly
    if (!clinic) {
      clinic = await db.clinic.findUnique({
        where: { id: slug },
        select: {
          id: true,
          name: true,
          phone: true,
          address: true,
          slotDuration: true,
          currency: true,
          bookingEnabled: true,
          isActive: true,
        },
      });
    }

    if (!clinic) {
      return NextResponse.json({ error: 'عيادة غير موجودة' }, { status: 404 });
    }

    // Auto-enable booking if it's not enabled
    if (!clinic.bookingEnabled) {
      await db.clinic.update({
        where: { id: clinic.id },
        data: { bookingEnabled: true },
      });
    }

    // Get available doctors in this clinic (include admin as fallback if no doctors)
    let doctors = await db.user.findMany({
      where: { clinicId: clinic.id, role: 'doctor', isActive: true },
      select: { id: true, fullName: true },
    });

    // If no doctors found, include admin/owner as available for booking
    if (doctors.length === 0) {
      doctors = await db.user.findMany({
        where: { clinicId: clinic.id, isActive: true, role: { in: ['admin', 'super_admin', 'doctor'] } },
        select: { id: true, fullName: true },
      });
    }

    return NextResponse.json({ clinic, doctors });
  } catch (error) {
    console.error('Booking GET error:', error);
    return NextResponse.json({ error: 'خطأ في الخادم' }, { status: 500 });
  }
}

// POST /api/booking/[slug] - Create a booking from public link
export async function POST(request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await params;
    const data = await request.json();
    
    // Try to find by bookingSlug first, then by id (fallback)
    let clinic = await db.clinic.findUnique({
      where: { bookingSlug: slug },
    });

    if (!clinic) {
      clinic = await db.clinic.findUnique({
        where: { id: slug },
      });
    }

    if (!clinic) {
      return NextResponse.json({ error: 'عيادة غير موجودة' }, { status: 404 });
    }

    // Auto-enable booking
    if (!clinic.bookingEnabled) {
      await db.clinic.update({
        where: { id: clinic.id },
        data: { bookingEnabled: true },
      });
    }

    // Validate required fields - patientName and patientPhone are always required
    if (!data.patientName || !data.patientPhone) {
      return NextResponse.json({ error: 'اسم المريض ورقم الهاتف مطلوبان' }, { status: 400 });
    }

    // Resolve doctor: validate or find available one
    let doctorId = data.doctorId || null;
    if (doctorId) {
      const doctor = await db.user.findFirst({
        where: { id: doctorId, clinicId: clinic.id, isActive: true },
      });
      if (!doctor) doctorId = null;
    }

    // If no valid doctor, find any available staff
    if (!doctorId) {
      const anyStaff = await db.user.findFirst({
        where: { clinicId: clinic.id, isActive: true, role: { in: ['admin', 'super_admin', 'doctor'] } },
      });
      if (anyStaff) {
        doctorId = anyStaff.id;
      } else {
        return NextResponse.json({ error: 'لا يوجد طبيب متاح في العيادة' }, { status: 400 });
      }
    }

    // Find or create patient
    let patient = await db.patient.findFirst({
      where: { phone: data.patientPhone, clinicId: clinic.id },
    });

    if (!patient) {
      const fileNumber = `PB-${Date.now().toString().slice(-8)}`;
      patient = await db.patient.create({
        data: {
          fileNumber,
          fullName: data.patientName,
          phone: data.patientPhone,
          email: data.patientEmail,
          gender: data.patientGender,
          age: data.patientAge,
          clinicId: clinic.id,
          notes: 'تم التسجيل عبر رابط الحجز العام',
        },
      });
    }

    // Create appointment
    const startTime = data.startTime || new Date().toISOString();
    const endTime = data.endTime || new Date(new Date(startTime).getTime() + clinic.slotDuration * 60000).toISOString();

    const appointment = await db.appointment.create({
      data: {
        patientId: patient.id,
        doctorId,
        clinicId: clinic.id,
        title: data.title || 'حجز من الرابط العام',
        startTime,
        endTime,
        type: data.type || 'regular',
        status: 'scheduled',
        notes: data.notes,
        createdBy: null,
      },
      include: {
        patient: { select: { fullName: true, phone: true } },
        doctor: { select: { fullName: true } },
      },
    });

    return NextResponse.json({ 
      message: 'تم حجز الموعد بنجاح',
      appointment 
    });
  } catch (error) {
    console.error('Booking POST error:', error);
    return NextResponse.json({ error: 'خطأ في الخادم' }, { status: 500 });
  }
}
