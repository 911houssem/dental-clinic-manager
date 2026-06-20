import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { hashPassword } from '@/lib/security';

// GET /api/init - Initialize database with admin user and demo data
// Public endpoint (called once after deployment)
// Idempotent: safe to call multiple times
export async function GET(request: NextRequest) {
  const startTime = Date.now();
  try {
    // Test database connection first
    let dbConnected = false;
    try {
      await db.$queryRaw`SELECT 1`;
      dbConnected = true;
    } catch (dbError) {
      return NextResponse.json({
        success: false,
        error: 'Database connection failed',
        details: String(dbError),
        hint: 'Check DATABASE_URL environment variable',
      }, { status: 500 });
    }

    // Check if admin exists
    const adminExists = await db.user.findFirst({
      where: { username: 'admin' }
    });

    if (adminExists) {
      const userCount = await db.user.count();
      const clinicCount = await db.clinic.count();
      const planCount = await db.subscriptionPlan.count();
      const offerCount = await db.offer.count();
      const patientCount = await db.patient.count();
      const appointmentCount = await db.appointment.count();

      return NextResponse.json({
        success: true,
        message: 'Database already initialized',
        adminExists: true,
        stats: {
          users: userCount,
          clinics: clinicCount,
          plans: planCount,
          offers: offerCount,
          patients: patientCount,
          appointments: appointmentCount,
        },
        adminCredentials: {
          username: 'admin',
          password: 'admin123',
        },
        timeMs: Date.now() - startTime,
      });
    }

    // === Create admin user ===
    const adminHash = await hashPassword('admin123');
    const admin = await db.user.create({
      data: {
        username: 'admin',
        passwordHash: adminHash,
        passwordPlain: 'admin123',
        fullName: 'المالك',
        role: 'super_admin',
        phone: '0500000000',
        email: 'admin@clinic.com',
        permissions: JSON.stringify({
          dashboard: true, patients: true, appointments: true,
          records: true, invoices: true, inventory: true,
          reports: true, settings: true,
        }),
        isActive: true,
        twoFactorEnabled: false,
        securityLevel: 'standard',
        emailVerified: true,
        lastPasswordChange: new Date(),
      },
    });

    // === Create default clinic ===
    const clinic = await db.clinic.create({
      data: {
        name: 'عيادة الشفاء',
        phone: '0501234567',
        address: 'الرياض، حي النزهة',
        taxNumber: '1234567890',
        currency: 'SAR',
        paymentMode: 'partial',
        slotDuration: 15,
        bookingSlug: 'عيادة-الشفاء',
        bookingEnabled: true,
      },
    });

    // === Create subscription plans ===
    const basicPlan = await db.subscriptionPlan.create({
      data: {
        name: 'أساسي', nameEn: 'Basic', description: 'للعيادات الصغيرة التي تبدأ رحلتها الرقمية',
        price: 99, yearlyPrice: 990,
        features: JSON.stringify(['إدارة المواعيد', 'ملفات المرضى', 'الفواتير الأساسية', 'دعم عبر البريد الإلكتروني']),
        modules: JSON.stringify(['appointments', 'patients', 'invoices']),
        maxPatients: 500, maxDoctors: 2, maxClinics: 1, isActive: true, isPopular: false, sortOrder: 1,
      },
    });
    const proPlan = await db.subscriptionPlan.create({
      data: {
        name: 'احترافي', nameEn: 'Professional', description: 'للعيادات المتوسطة التي تحتاج ميزات متقدمة',
        price: 249, yearlyPrice: 2490,
        features: JSON.stringify(['إدارة المواعيد', 'ملفات المرضى', 'الفواتير المتقدمة', 'المخزون', 'التقارير', 'دعم أولوية', 'رابط الحجز العام']),
        modules: JSON.stringify(['appointments', 'patients', 'invoices', 'inventory', 'reports', 'records']),
        maxPatients: 2000, maxDoctors: 5, maxClinics: 3, isActive: true, isPopular: true, sortOrder: 2,
      },
    });
    const premiumPlan = await db.subscriptionPlan.create({
      data: {
        name: 'ممتاز', nameEn: 'Premium', description: 'للعيادات الكبيرة والسلاسل الطبية',
        price: 499, yearlyPrice: 4990,
        features: JSON.stringify(['جميع مميزات الاحترافي', 'إدارة متعددة العيادات', 'صلاحيات متقدمة', 'التقارير المالية', 'المهام', 'دعم مخصص ٢٤/٧', 'تخصيص كامل']),
        modules: JSON.stringify(['appointments', 'patients', 'invoices', 'inventory', 'reports', 'records', 'tasks', 'management', 'settings']),
        maxPatients: -1, maxDoctors: -1, maxClinics: -1, isActive: true, isPopular: false, sortOrder: 3,
      },
    });

    // === Grant default clinic a subscription ===
    await db.clinicSubscription.create({
      data: {
        clinicId: clinic.id, planId: proPlan.id, status: 'active',
        startDate: new Date(), endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
        notes: 'اشتراك تجريبي - تم إنشاؤه تلقائياً', autoRenew: true,
      },
    });

    // === Create offers ===
    await db.offer.create({ data: { title: 'خصم الإطلاق', description: 'احصل على خصم ٣٠٪ عند الاشتراك لأول مرة', discountType: 'percentage', discountValue: 30, planId: proPlan.id, isActive: true, showOnLanding: true, badge: 'عرض خاص', sortOrder: 1 } });
    await db.offer.create({ data: { title: 'اشترك سنة ووفّر', description: 'وفّر ما يعادل شهرين عند الاشتراك السنوي', discountType: 'percentage', discountValue: 17, planId: premiumPlan.id, isActive: true, showOnLanding: true, badge: 'خصم ١٧٪', sortOrder: 2 } });
    await db.offer.create({ data: { title: 'تجربة مجانية', description: 'جرب الخطة الاحترافية مجاناً لمدة ١٤ يوماً', discountType: 'percentage', discountValue: 100, planId: basicPlan.id, isActive: true, showOnLanding: true, badge: 'مجاني', sortOrder: 3 } });

    // === Create doctor user ===
    const doctorHash = await hashPassword('doctor123');
    await db.user.create({
      data: {
        username: 'doctor1', passwordHash: doctorHash, passwordPlain: 'doctor123',
        fullName: 'د. أحمد محمد', role: 'doctor', phone: '0501111111', email: 'doctor@clinic.com',
        clinicId: clinic.id,
        permissions: JSON.stringify({ dashboard: true, patients: true, appointments: true, records: true, invoices: true, inventory: false, reports: false, settings: false }),
        isActive: true, twoFactorEnabled: false, securityLevel: 'standard',
      },
    });

    // === Create reception user ===
    const receptionHash = await hashPassword('reception123');
    await db.user.create({
      data: {
        username: 'reception1', passwordHash: receptionHash, passwordPlain: 'reception123',
        fullName: 'سارة أحمد', role: 'reception', phone: '0502222222', email: 'reception@clinic.com',
        clinicId: clinic.id,
        permissions: JSON.stringify({ dashboard: true, patients: true, appointments: true, records: false, invoices: true, inventory: false, reports: false, settings: false }),
        isActive: true, twoFactorEnabled: false, securityLevel: 'standard',
      },
    });

    // === Create sample patients ===
    const patientNames = [
      { name: 'محمد علي', phone: '0551234567', gender: 'male', age: '25', bloodType: 'A+' },
      { name: 'فاطمة أحمد', phone: '0552345678', gender: 'female', age: '30', bloodType: 'B+' },
      { name: 'خالد سعيد', phone: '0553456789', gender: 'male', age: '35', bloodType: 'O+' },
      { name: 'نورة عبدالله', phone: '0554567890', gender: 'female', age: '40', bloodType: 'AB+' },
      { name: 'عمر حسن', phone: '0555678901', gender: 'male', age: '45', bloodType: 'A-' },
      { name: 'مريم يوسف', phone: '0556789012', gender: 'female', age: '50', bloodType: 'B-' },
      { name: 'يوسف إبراهيم', phone: '0557890123', gender: 'male', age: '55', bloodType: 'O-' },
      { name: 'هند سالم', phone: '0558901234', gender: 'female', age: '60', bloodType: 'AB-' },
    ];
    const patients = [];
    for (let i = 0; i < patientNames.length; i++) {
      const p = patientNames[i];
      const patient = await db.patient.create({
        data: {
          fileNumber: `CL-${Date.now().toString().slice(-8)}${i}`,
          fullName: p.name, phone: p.phone, gender: p.gender, age: p.age,
          bloodType: p.bloodType, clinicId: clinic.id,
        },
      });
      patients.push(patient);
    }

    // === Create sample appointments ===
    const today = new Date().toISOString().split('T')[0];
    const doctor = await db.user.findFirst({ where: { role: 'doctor' } });
    if (doctor && patients.length >= 4) {
      const aptData = [
        { patientId: patients[0].id, time: '09:00', type: 'regular', title: 'كشف عام' },
        { patientId: patients[1].id, time: '09:30', type: 'follow_up', title: 'متابعة' },
        { patientId: patients[2].id, time: '10:00', type: 'consultation', title: 'استشارة' },
        { patientId: patients[3].id, time: '10:30', type: 'emergency', title: 'طوارئ' },
      ];
      for (const apt of aptData) {
        await db.appointment.create({
          data: {
            patientId: apt.patientId, doctorId: doctor.id, clinicId: clinic.id,
            title: apt.title,
            startTime: `${today}T${apt.time}:00`,
            endTime: `${today}T${String(parseInt(apt.time.split(':')[0]) + 1).padStart(2, '0')}:${apt.time.split(':')[1]}:00`,
            type: apt.type, status: 'scheduled',
          },
        });
      }
    }

    // === Create sample invoices ===
    if (patients.length >= 4) {
      const invoiceData = [
        { patientId: patients[0].id, subtotal: 200, paid: 200, status: 'paid' },
        { patientId: patients[1].id, subtotal: 350, paid: 350, status: 'paid' },
        { patientId: patients[2].id, subtotal: 150, paid: 0, status: 'pending' },
        { patientId: patients[3].id, subtotal: 500, paid: 250, status: 'partial' },
      ];
      for (const inv of invoiceData) {
        const tax = inv.subtotal * 0.15;
        const total = inv.subtotal + tax;
        await db.invoice.create({
          data: {
            invoiceNumber: `INV-${new Date().toISOString().slice(0, 7).replace('-', '')}-${Date.now().toString().slice(-6)}`,
            patientId: inv.patientId, clinicId: clinic.id,
            subtotal: inv.subtotal, taxPercentage: 15, taxAmount: tax, total,
            paidAmount: inv.paid, dueAmount: total - inv.paid,
            status: inv.status, paymentMethod: inv.status === 'paid' ? 'cash' : null,
            items: JSON.stringify([{ item_name: 'كشف طبي', unit_price: inv.subtotal, quantity: 1 }]),
          },
        });
      }
    }

    // === Create sample inventory ===
    const inventoryItems = [
      { name: 'باراسيتامول 500mg', type: 'medication', qty: 500, buy: 2, sell: 5 },
      { name: 'أموكسيسيلين 250mg', type: 'medication', qty: 200, buy: 5, sell: 12 },
      { name: 'قفازات طبية', type: 'supply', qty: 1000, buy: 0.5, sell: 1 },
      { name: 'إبرة حقن', type: 'supply', qty: 300, buy: 1, sell: 2.5 },
      { name: 'جهاز ضغط', type: 'equipment', qty: 3, buy: 200, sell: 350 },
    ];
    for (const item of inventoryItems) {
      await db.inventoryItem.create({
        data: {
          itemName: item.name, itemType: item.type, quantity: item.qty,
          purchasePrice: item.buy, sellingPrice: item.sell, clinicId: clinic.id,
        },
      });
    }

    return NextResponse.json({
      success: true,
      message: 'تم تهيئة قاعدة البيانات بنجاح مع البيانات التجريبية',
      adminCredentials: {
        username: 'admin',
        password: 'admin123',
      },
      demoUsers: [
        { username: 'admin', password: 'admin123', role: 'المالك' },
        { username: 'doctor1', password: 'doctor123', role: 'طبيب' },
        { username: 'reception1', password: 'reception123', role: 'استقبال' },
      ],
      stats: {
        users: await db.user.count(),
        clinics: await db.clinic.count(),
        plans: await db.subscriptionPlan.count(),
        offers: await db.offer.count(),
        patients: await db.patient.count(),
        appointments: await db.appointment.count(),
        invoices: await db.invoice.count(),
        inventoryItems: await db.inventoryItem.count(),
      },
      timeMs: Date.now() - startTime,
    });
  } catch (error) {
    console.error('Init error:', error);
    return NextResponse.json({
      success: false,
      error: 'Init failed',
      details: String(error),
      stack: process.env.NODE_ENV === 'development' ? String(error).split('\n') : undefined,
    }, { status: 500 });
  }
}
