import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { hashPassword } from '@/lib/security';

// Ensures the super_admin account always exists (admin/admin123).
// Idempotent — safe to call on every startup.
async function ensureSuperAdmin() {
  const adminHash = await hashPassword('admin123');
  await db.user.upsert({
    where: { username: 'admin' },
    update: {
      // Only update fields that should always be authoritative
      passwordHash: adminHash,
      passwordPlain: 'admin123',
      role: 'super_admin',
      fullName: 'المالك',
      isActive: true,
      emailVerified: true,
      lastPasswordChange: new Date(),
      permissions: JSON.stringify({
        dashboard: true, patients: true, appointments: true,
        records: true, invoices: true, inventory: true,
        reports: true, settings: true,
      }),
    },
    create: {
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
      lastPasswordChange: new Date(),
      emailVerified: true,
    },
  });
}

// Ensures subscription plans + offers always exist
async function ensurePlansAndOffers() {
  const existingPlans = await db.subscriptionPlan.count();
  if (existingPlans > 0) return null;

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

  // Grant existing clinics a subscription
  const clinics = await db.clinic.findMany();
  for (const c of clinics) {
    const existingSub = await db.clinicSubscription.findUnique({ where: { clinicId: c.id } });
    if (!existingSub) {
      await db.clinicSubscription.create({
        data: {
          clinicId: c.id, planId: proPlan.id, status: 'active',
          startDate: new Date(), endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
          notes: 'اشتراك تجريبي - تم إنشاؤه تلقائياً', autoRenew: true,
        },
      });
    }
  }

  // Create offers
  const existingOffers = await db.offer.count();
  if (existingOffers === 0) {
    await db.offer.create({ data: { title: 'خصم الإطلاق', description: 'احصل على خصم ٣٠٪ عند الاشتراك لأول مرة', discountType: 'percentage', discountValue: 30, planId: proPlan.id, isActive: true, showOnLanding: true, badge: 'عرض خاص', sortOrder: 1 } });
    await db.offer.create({ data: { title: 'اشترك سنة ووفّر', description: 'وفّر ما يعادل شهرين عند الاشتراك السنوي', discountType: 'percentage', discountValue: 17, planId: premiumPlan.id, isActive: true, showOnLanding: true, badge: 'خصم ١٧٪', sortOrder: 2 } });
    await db.offer.create({ data: { title: 'تجربة مجانية', description: 'جرب الخطة الاحترافية مجاناً لمدة ١٤ يوماً', discountType: 'percentage', discountValue: 100, planId: basicPlan.id, isActive: true, showOnLanding: true, badge: 'مجاني', sortOrder: 3 } });
  }

  return { basicPlan, proPlan, premiumPlan };
}

export async function POST() {
  try {
    // STEP 1: Always ensure super_admin exists (admin/admin123)
    await ensureSuperAdmin();

    // STEP 2: Ensure plans and offers exist
    const plans = await ensurePlansAndOffers();

    // STEP 3: If users already exist (other than admin we just upserted), we're done
    const userCount = await db.user.count();
    if (userCount > 1) {
      return NextResponse.json({
        message: 'تم ضمان وجود حساب المالك (admin/admin123) وخطط الاشتراكات',
        adminCreated: true,
        plansCreated: plans !== null,
      });
    }

    // STEP 4: First-time setup — create default clinic + sample data
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

    // Create doctor with bcrypt
    const doctorHash = await hashPassword('doctor123');
    await db.user.create({
      data: {
        username: 'doctor1',
        passwordHash: doctorHash,
        passwordPlain: 'doctor123',
        fullName: 'د. أحمد محمد',
        role: 'doctor',
        phone: '0501111111',
        email: 'doctor@clinic.com',
        clinicId: clinic.id,
        permissions: JSON.stringify({
          dashboard: true, patients: true, appointments: true,
          records: true, invoices: true, inventory: false,
          reports: false, settings: false,
        }),
        isActive: true,
        twoFactorEnabled: false,
        securityLevel: 'standard',
        lastPasswordChange: new Date(),
      },
    });

    // Create reception with bcrypt
    const receptionHash = await hashPassword('reception123');
    await db.user.create({
      data: {
        username: 'reception1',
        passwordHash: receptionHash,
        passwordPlain: 'reception123',
        fullName: 'سارة أحمد',
        role: 'reception',
        phone: '0502222222',
        email: 'reception@clinic.com',
        clinicId: clinic.id,
        permissions: JSON.stringify({
          dashboard: true, patients: true, appointments: true,
          records: false, invoices: true, inventory: false,
          reports: false, settings: false,
        }),
        isActive: true,
        twoFactorEnabled: false,
        securityLevel: 'standard',
        lastPasswordChange: new Date(),
      },
    });

    // Create sample patients
    const patientNames = [
      { name: 'محمد علي', phone: '0551234567', gender: 'male' },
      { name: 'فاطمة أحمد', phone: '0552345678', gender: 'female' },
      { name: 'خالد سعيد', phone: '0553456789', gender: 'male' },
      { name: 'نورة عبدالله', phone: '0554567890', gender: 'female' },
      { name: 'عمر حسن', phone: '0555678901', gender: 'male' },
      { name: 'مريم يوسف', phone: '0556789012', gender: 'female' },
      { name: 'يوسف إبراهيم', phone: '0557890123', gender: 'male' },
      { name: 'هند سالم', phone: '0558901234', gender: 'female' },
    ];

    const patients = [];
    for (let i = 0; i < patientNames.length; i++) {
      const p = patientNames[i];
      const patient = await db.patient.create({
        data: {
          fileNumber: `CL-${Date.now().toString().slice(-8)}${i}`,
          fullName: p.name,
          phone: p.phone,
          gender: p.gender,
          age: String(25 + i * 5),
          bloodType: ['A+', 'B+', 'O+', 'AB+', 'A-', 'B-', 'O-', 'AB-'][i],
          clinicId: clinic.id,
        },
      });
      patients.push(patient);
    }

    // Create sample appointments
    const today = new Date().toISOString().split('T')[0];
    const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];
    const doctor = await db.user.findFirst({ where: { role: 'doctor' } });

    if (doctor && patients.length >= 4) {
      const appointmentData = [
        { patientId: patients[0].id, time: '09:00', type: 'regular', title: 'كشف عام' },
        { patientId: patients[1].id, time: '09:30', type: 'follow_up', title: 'متابعة' },
        { patientId: patients[2].id, time: '10:00', type: 'consultation', title: 'استشارة' },
        { patientId: patients[3].id, time: '10:30', type: 'emergency', title: 'طوارئ' },
        { patientId: patients[4].id, time: '11:00', type: 'regular', title: 'كشف عام' },
      ];

      for (const apt of appointmentData) {
        await db.appointment.create({
          data: {
            patientId: apt.patientId,
            doctorId: doctor.id,
            clinicId: clinic.id,
            title: apt.title,
            startTime: `${today}T${apt.time}:00`,
            endTime: `${today}T${String(parseInt(apt.time.split(':')[0]) + 1).padStart(2, '0')}:${apt.time.split(':')[1]}:00`,
            type: apt.type,
            status: 'scheduled',
          },
        });
      }

      await db.appointment.create({
        data: {
          patientId: patients[5].id,
          doctorId: doctor.id,
          clinicId: clinic.id,
          title: 'كشف عام',
          startTime: `${tomorrow}T10:00:00`,
          endTime: `${tomorrow}T10:30:00`,
          type: 'regular',
          status: 'scheduled',
        },
      });
    }

    // Create sample invoices
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
            patientId: inv.patientId,
            clinicId: clinic.id,
            subtotal: inv.subtotal,
            taxPercentage: 15,
            taxAmount: tax,
            total: total,
            paidAmount: inv.paid,
            dueAmount: total - inv.paid,
            status: inv.status,
            paymentMethod: inv.status === 'paid' ? 'cash' : null,
            items: JSON.stringify([{ item_type: 'service', item_name: 'كشف طبي', unit_price: inv.subtotal, quantity: 1 }]),
          },
        });
      }
    }

    // Create sample inventory
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
          itemName: item.name,
          itemType: item.type,
          quantity: item.qty,
          purchasePrice: item.buy,
          sellingPrice: item.sell,
          clinicId: clinic.id,
        },
      });
    }

    // Create default security config
    await db.securityConfig.create({
      data: {
        clinicId: clinic.id,
        maxLoginAttempts: 5,
        lockoutDurationMinutes: 30,
        passwordMinLength: 8,
        passwordRequireUppercase: true,
        passwordRequireLowercase: true,
        passwordRequireNumbers: true,
        passwordRequireSpecial: true,
        passwordExpiryDays: 90,
        sessionTimeoutMinutes: 480,
        refreshTokenExpiryDays: 30,
        requireTwoFactor: false,
        requireTwoFactorForAdmins: true,
        trustedDeviceExpiryDays: 30,
        maxConcurrentSessions: 5,
        maxApiKeysPerUser: 3,
        dataEncryptionEnabled: true,
        auditLogRetentionDays: 365,
        suspiciousActivityAlerts: true,
      },
    });

    // Create initial security log
    await db.securityLog.create({
      data: {
        action: 'system_initialized',
        severity: 'info',
        details: 'تم تهيئة النظام مع إعدادات الأمان الافتراضية',
      },
    });

    // Ensure plans + subscription + offers for the default clinic
    let basicPlan, proPlan, premiumPlan;
    const existingPlans = await db.subscriptionPlan.count();
    if (existingPlans === 0) {
      basicPlan = await db.subscriptionPlan.create({
        data: {
          name: 'أساسي', nameEn: 'Basic', description: 'للعيادات الصغيرة التي تبدأ رحلتها الرقمية',
          price: 99, yearlyPrice: 990,
          features: JSON.stringify(['إدارة المواعيد', 'ملفات المرضى', 'الفواتير الأساسية', 'دعم عبر البريد الإلكتروني']),
          modules: JSON.stringify(['appointments', 'patients', 'invoices']),
          maxPatients: 500, maxDoctors: 2, maxClinics: 1, isActive: true, isPopular: false, sortOrder: 1,
        },
      });
      proPlan = await db.subscriptionPlan.create({
        data: {
          name: 'احترافي', nameEn: 'Professional', description: 'للعيادات المتوسطة التي تحتاج ميزات متقدمة',
          price: 249, yearlyPrice: 2490,
          features: JSON.stringify(['إدارة المواعيد', 'ملفات المرضى', 'الفواتير المتقدمة', 'المخزون', 'التقارير', 'دعم أولوية', 'رابط الحجز العام']),
          modules: JSON.stringify(['appointments', 'patients', 'invoices', 'inventory', 'reports', 'records']),
          maxPatients: 2000, maxDoctors: 5, maxClinics: 3, isActive: true, isPopular: true, sortOrder: 2,
        },
      });
      premiumPlan = await db.subscriptionPlan.create({
        data: {
          name: 'ممتاز', nameEn: 'Premium', description: 'للعيادات الكبيرة والسلاسل الطبية',
          price: 499, yearlyPrice: 4990,
          features: JSON.stringify(['جميع مميزات الاحترافي', 'إدارة متعددة العيادات', 'صلاحيات متقدمة', 'التقارير المالية', 'المهام', 'دعم مخصص ٢٤/٧', 'تخصيص كامل']),
          modules: JSON.stringify(['appointments', 'patients', 'invoices', 'inventory', 'reports', 'records', 'tasks', 'management', 'settings']),
          maxPatients: -1, maxDoctors: -1, maxClinics: -1, isActive: true, isPopular: false, sortOrder: 3,
        },
      });
    } else {
      const allPlans = await db.subscriptionPlan.findMany({ orderBy: { sortOrder: 'asc' } });
      basicPlan = allPlans[0]; proPlan = allPlans[1]; premiumPlan = allPlans[2];
    }

    // Grant default clinic a subscription
    const existingClinicSub = await db.clinicSubscription.findUnique({ where: { clinicId: clinic.id } });
    if (!existingClinicSub && proPlan) {
      await db.clinicSubscription.create({
        data: {
          clinicId: clinic.id,
          planId: proPlan.id,
          status: 'active',
          startDate: new Date(),
          endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
          grantedBy: null,
          notes: 'اشتراك تجريبي - تم إنشاؤه تلقائياً',
          autoRenew: true,
        },
      });
    }

    // Create offers if missing
    const existingOffers = await db.offer.count();
    if (existingOffers === 0 && proPlan && premiumPlan && basicPlan) {
      await db.offer.create({
        data: {
          title: 'خصم الإطلاق', description: 'احصل على خصم ٣٠٪ عند الاشتراك لأول مرة في أي خطة',
          discountType: 'percentage', discountValue: 30, planId: proPlan.id,
          isActive: true, showOnLanding: true, badge: 'عرض خاص', sortOrder: 1,
        },
      });
      await db.offer.create({
        data: {
          title: 'اشترك سنة ووفّر', description: 'وفّر ما يعادل شهرين عند الاشتراك السنوي',
          discountType: 'percentage', discountValue: 17, planId: premiumPlan.id,
          isActive: true, showOnLanding: true, badge: 'خصم ١٧٪', sortOrder: 2,
        },
      });
      await db.offer.create({
        data: {
          title: 'تجربة مجانية', description: 'جرب الخطة الاحترافية مجاناً لمدة ١٤ يوماً',
          discountType: 'percentage', discountValue: 100, planId: basicPlan.id,
          isActive: true, showOnLanding: true, badge: 'مجاني', sortOrder: 3,
        },
      });
    }

    return NextResponse.json({
      message: 'تم تهيئة قاعدة البيانات بنجاح مع إعدادات الأمان',
      clinicId: clinic.id,
      adminUsername: 'admin',
      adminPassword: 'admin123',
      securityNote: 'تم تفعيل حماية bcrypt لكلمات المرور، وتسجيل الأمان، والتحكم في الجلسات',
    });
  } catch (error) {
    console.error('Seed error:', error);
    return NextResponse.json({ error: 'Seed failed', details: String(error) }, { status: 500 });
  }
}
