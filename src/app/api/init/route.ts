import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { hashPassword } from '@/lib/security';

// GET /api/init - Initialize database with admin user and demo data
// Public endpoint (called once after deployment)
export async function GET(request: NextRequest) {
  try {
    // Check if admin exists
    const adminExists = await db.user.findFirst({
      where: { username: 'admin' }
    });

    if (adminExists) {
      return NextResponse.json({
        message: 'Database already initialized',
        adminExists: true,
        totalUsers: await db.user.count(),
        totalClinics: await db.clinic.count(),
      });
    }

    // Create admin user
    const adminHash = await hashPassword('admin123');
    await db.user.create({
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
      },
    });

    // Create default clinic
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

    // Create subscription plans
    const basicPlan = await db.subscriptionPlan.create({
      data: {
        name: 'أساسي', nameEn: 'Basic', description: 'للعيادات الصغيرة التي تبدأ رحلتها الرقمية',
        price: 99, yearlyPrice: 990,
        features: JSON.stringify(['إدارة المواعيد', 'ملفات المرضى', 'الفواتير الأساسية']),
        modules: JSON.stringify(['appointments', 'patients', 'invoices']),
        maxPatients: 500, maxDoctors: 2, maxClinics: 1, isActive: true, isPopular: false, sortOrder: 1,
      },
    });
    const proPlan = await db.subscriptionPlan.create({
      data: {
        name: 'احترافي', nameEn: 'Professional', description: 'للعيادات المتوسطة',
        price: 249, yearlyPrice: 2490,
        features: JSON.stringify(['إدارة المواعيد', 'ملفات المرضى', 'الفواتير المتقدمة', 'المخزون', 'التقارير']),
        modules: JSON.stringify(['appointments', 'patients', 'invoices', 'inventory', 'reports', 'records']),
        maxPatients: 2000, maxDoctors: 5, maxClinics: 3, isActive: true, isPopular: true, sortOrder: 2,
      },
    });
    const premiumPlan = await db.subscriptionPlan.create({
      data: {
        name: 'ممتاز', nameEn: 'Premium', description: 'للعيادات الكبيرة',
        price: 499, yearlyPrice: 4990,
        features: JSON.stringify(['جميع مميزات الاحترافي', 'إدارة متعددة العيادات', 'صلاحيات متقدمة']),
        modules: JSON.stringify(['appointments', 'patients', 'invoices', 'inventory', 'reports', 'records', 'tasks']),
        maxPatients: -1, maxDoctors: -1, maxClinics: -1, isActive: true, isPopular: false, sortOrder: 3,
      },
    });

    // Grant default clinic a subscription
    await db.clinicSubscription.create({
      data: {
        clinicId: clinic.id, planId: proPlan.id, status: 'active',
        startDate: new Date(), endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
        notes: 'اشتراك تجريبي', autoRenew: true,
      },
    });

    // Create offers
    await db.offer.create({ data: { title: 'خصم الإطلاق', description: 'خصم ٣٠٪', discountType: 'percentage', discountValue: 30, planId: proPlan.id, isActive: true, showOnLanding: true, badge: 'عرض خاص', sortOrder: 1 } });
    await db.offer.create({ data: { title: 'اشترك سنة ووفّر', description: 'خصم ١٧٪', discountType: 'percentage', discountValue: 17, planId: premiumPlan.id, isActive: true, showOnLanding: true, badge: 'خصم ١٧٪', sortOrder: 2 } });
    await db.offer.create({ data: { title: 'تجربة مجانية', description: 'مجاني ١٤ يوم', discountType: 'percentage', discountValue: 100, planId: basicPlan.id, isActive: true, showOnLanding: true, badge: 'مجاني', sortOrder: 3 } });

    return NextResponse.json({
      message: 'Database initialized successfully!',
      admin: { username: 'admin', password: 'admin123' },
      clinicId: clinic.id,
    });
  } catch (error) {
    console.error('Init error:', error);
    return NextResponse.json({ error: 'Init failed', details: String(error) }, { status: 500 });
  }
}
