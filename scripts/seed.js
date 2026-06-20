#!/usr/bin/env node
/**
 * Prisma Seed Script - يقوم بتهيئة قاعدة البيانات بالبيانات الأساسية
 * يتم تشغيله تلقائياً بعد prisma db push أثناء البناء على Netlify
 * 
 * Idempotent: آمن للتشغيل المتعدد - يتحقق من وجود البيانات قبل إنشائها
 */

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function hashPassword(password) {
  return bcrypt.hash(password, 12);
}

async function main() {
  console.log('🌱 Starting database seed...');

  // === 1) Check if admin exists ===
  const adminExists = await prisma.user.findFirst({
    where: { username: 'admin' }
  });

  if (adminExists) {
    console.log('✓ Admin user already exists, skipping seed');
    const stats = {
      users: await prisma.user.count(),
      clinics: await prisma.clinic.count(),
      plans: await prisma.subscriptionPlan.count(),
      offers: await prisma.offer.count(),
    };
    console.log('📊 Database stats:', stats);
    return;
  }

  // === 2) Create admin user ===
  console.log('👤 Creating admin user...');
  const adminHash = await hashPassword('admin123');
  await prisma.user.create({
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
  console.log('✓ Admin user created (admin/admin123)');

  // === 3) Create default clinic ===
  console.log('🏥 Creating default clinic...');
  const clinic = await prisma.clinic.create({
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
  console.log('✓ Default clinic created:', clinic.name);

  // === 4) Create subscription plans ===
  console.log('💎 Creating subscription plans...');
  const basicPlan = await prisma.subscriptionPlan.create({
    data: {
      name: 'أساسي', nameEn: 'Basic', description: 'للعيادات الصغيرة',
      price: 99, yearlyPrice: 990,
      features: JSON.stringify(['إدارة المواعيد', 'ملفات المرضى', 'الفواتير الأساسية']),
      modules: JSON.stringify(['appointments', 'patients', 'invoices']),
      maxPatients: 500, maxDoctors: 2, maxClinics: 1, isActive: true, isPopular: false, sortOrder: 1,
    },
  });
  const proPlan = await prisma.subscriptionPlan.create({
    data: {
      name: 'احترافي', nameEn: 'Professional', description: 'للعيادات المتوسطة',
      price: 249, yearlyPrice: 2490,
      features: JSON.stringify(['إدارة المواعيد', 'ملفات المرضى', 'الفواتير المتقدمة', 'المخزون', 'التقارير']),
      modules: JSON.stringify(['appointments', 'patients', 'invoices', 'inventory', 'reports', 'records']),
      maxPatients: 2000, maxDoctors: 5, maxClinics: 3, isActive: true, isPopular: true, sortOrder: 2,
    },
  });
  const premiumPlan = await prisma.subscriptionPlan.create({
    data: {
      name: 'ممتاز', nameEn: 'Premium', description: 'للعيادات الكبيرة',
      price: 499, yearlyPrice: 4990,
      features: JSON.stringify(['جميع مميزات الاحترافي', 'إدارة متعددة العيادات', 'صلاحيات متقدمة']),
      modules: JSON.stringify(['appointments', 'patients', 'invoices', 'inventory', 'reports', 'records', 'tasks']),
      maxPatients: -1, maxDoctors: -1, maxClinics: -1, isActive: true, isPopular: false, sortOrder: 3,
    },
  });
  console.log('✓ 3 subscription plans created');

  // === 5) Grant default clinic a subscription ===
  await prisma.clinicSubscription.create({
    data: {
      clinicId: clinic.id, planId: proPlan.id, status: 'active',
      startDate: new Date(), endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      notes: 'اشتراك تجريبي - تم إنشاؤه تلقائياً', autoRenew: true,
    },
  });
  console.log('✓ Default clinic subscription granted');

  // === 6) Create offers ===
  console.log('🎁 Creating offers...');
  await prisma.offer.create({ data: { title: 'خصم الإطلاق', description: 'احصل على خصم ٣٠٪', discountType: 'percentage', discountValue: 30, planId: proPlan.id, isActive: true, showOnLanding: true, badge: 'عرض خاص', sortOrder: 1 } });
  await prisma.offer.create({ data: { title: 'اشترك سنة ووفّر', description: 'وفّر ما يعادل شهرين', discountType: 'percentage', discountValue: 17, planId: premiumPlan.id, isActive: true, showOnLanding: true, badge: 'خصم ١٧٪', sortOrder: 2 } });
  await prisma.offer.create({ data: { title: 'تجربة مجانية', description: 'جرب الخطة الاحترافية مجاناً', discountType: 'percentage', discountValue: 100, planId: basicPlan.id, isActive: true, showOnLanding: true, badge: 'مجاني', sortOrder: 3 } });
  console.log('✓ 3 offers created');

  // === 7) Create doctor + reception users ===
  console.log('👥 Creating demo users...');
  const doctorHash = await hashPassword('doctor123');
  await prisma.user.create({
    data: {
      username: 'doctor1', passwordHash: doctorHash, passwordPlain: 'doctor123',
      fullName: 'د. أحمد محمد', role: 'doctor', phone: '0501111111', email: 'doctor@clinic.com',
      clinicId: clinic.id,
      permissions: JSON.stringify({ dashboard: true, patients: true, appointments: true, records: true, invoices: true, inventory: false, reports: false, settings: false }),
      isActive: true, twoFactorEnabled: false, securityLevel: 'standard',
    },
  });

  const receptionHash = await hashPassword('reception123');
  await prisma.user.create({
    data: {
      username: 'reception1', passwordHash: receptionHash, passwordPlain: 'reception123',
      fullName: 'سارة أحمد', role: 'reception', phone: '0502222222', email: 'reception@clinic.com',
      clinicId: clinic.id,
      permissions: JSON.stringify({ dashboard: true, patients: true, appointments: true, records: false, invoices: true, inventory: false, reports: false, settings: false }),
      isActive: true, twoFactorEnabled: false, securityLevel: 'standard',
    },
  });
  console.log('✓ Doctor (doctor1/doctor123) + Reception (reception1/reception123) created');

  // === 8) Create sample patients ===
  console.log('👥 Creating sample patients...');
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
  for (let i = 0; i < patientNames.length; i++) {
    const p = patientNames[i];
    await prisma.patient.create({
      data: {
        fileNumber: `CL-${Date.now().toString().slice(-8)}${i}`,
        fullName: p.name, phone: p.phone, gender: p.gender, age: p.age,
        bloodType: p.bloodType, clinicId: clinic.id,
      },
    });
  }
  console.log(`✓ ${patientNames.length} sample patients created`);

  // === 9) Create sample appointments ===
  console.log('📅 Creating sample appointments...');
  const today = new Date().toISOString().split('T')[0];
  const doctor = await prisma.user.findFirst({ where: { role: 'doctor' } });
  const patients = await prisma.patient.findMany({ take: 4 });
  if (doctor && patients.length >= 4) {
    const aptData = [
      { patientId: patients[0].id, time: '09:00', type: 'regular', title: 'كشف عام' },
      { patientId: patients[1].id, time: '09:30', type: 'follow_up', title: 'متابعة' },
      { patientId: patients[2].id, time: '10:00', type: 'consultation', title: 'استشارة' },
      { patientId: patients[3].id, time: '10:30', type: 'emergency', title: 'طوارئ' },
    ];
    for (const apt of aptData) {
      await prisma.appointment.create({
        data: {
          patientId: apt.patientId, doctorId: doctor.id, clinicId: clinic.id,
          title: apt.title,
          startTime: `${today}T${apt.time}:00`,
          endTime: `${today}T${String(parseInt(apt.time.split(':')[0]) + 1).padStart(2, '0')}:${apt.time.split(':')[1]}:00`,
          type: apt.type, status: 'scheduled',
        },
      });
    }
    console.log('✓ 4 sample appointments created');
  }

  // === 10) Create sample invoices ===
  console.log('🧾 Creating sample invoices...');
  const allPatients = await prisma.patient.findMany({ take: 4 });
  if (allPatients.length >= 4) {
    const invoiceData = [
      { patientId: allPatients[0].id, subtotal: 200, paid: 200, status: 'paid' },
      { patientId: allPatients[1].id, subtotal: 350, paid: 350, status: 'paid' },
      { patientId: allPatients[2].id, subtotal: 150, paid: 0, status: 'pending' },
      { patientId: allPatients[3].id, subtotal: 500, paid: 250, status: 'partial' },
    ];
    for (const inv of invoiceData) {
      const tax = inv.subtotal * 0.15;
      const total = inv.subtotal + tax;
      await prisma.invoice.create({
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
    console.log('✓ 4 sample invoices created');
  }

  // === 11) Create sample inventory ===
  console.log('📦 Creating sample inventory...');
  const inventoryItems = [
    { name: 'باراسيتامول 500mg', type: 'medication', qty: 500, buy: 2, sell: 5 },
    { name: 'أموكسيسيلين 250mg', type: 'medication', qty: 200, buy: 5, sell: 12 },
    { name: 'قفازات طبية', type: 'supply', qty: 1000, buy: 0.5, sell: 1 },
    { name: 'إبرة حقن', type: 'supply', qty: 300, buy: 1, sell: 2.5 },
    { name: 'جهاز ضغط', type: 'equipment', qty: 3, buy: 200, sell: 350 },
  ];
  for (const item of inventoryItems) {
    await prisma.inventoryItem.create({
      data: {
        itemName: item.name, itemType: item.type, quantity: item.qty,
        purchasePrice: item.buy, sellingPrice: item.sell, clinicId: clinic.id,
      },
    });
  }
  console.log(`✓ ${inventoryItems.length} inventory items created`);

  // === Final stats ===
  const finalStats = {
    users: await prisma.user.count(),
    clinics: await prisma.clinic.count(),
    plans: await prisma.subscriptionPlan.count(),
    offers: await prisma.offer.count(),
    patients: await prisma.patient.count(),
    appointments: await prisma.appointment.count(),
    invoices: await prisma.invoice.count(),
    inventoryItems: await prisma.inventoryItem.count(),
  };
  console.log('');
  console.log('🎉 Seed completed successfully!');
  console.log('📊 Final stats:', finalStats);
  console.log('');
  console.log('🔐 Login credentials:');
  console.log('   Admin:     admin / admin123');
  console.log('   Doctor:    doctor1 / doctor123');
  console.log('   Reception: reception1 / reception123');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    console.error('Details:', e.message);
    // Don't exit with error code 1 - we don't want to fail the build
    // The /api/init endpoint can still be called manually
    process.exit(0);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
