import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { hashPassword, sanitizeInput } from '@/lib/security';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username, password, fullName, phone, email, clinicName, clinicPhone, clinicAddress, clinicCurrency } = body;

    // Validate required fields
    if (!username || !password || !fullName || !clinicName) {
      return NextResponse.json({
        error: 'اسم المستخدم وكلمة المرور والاسم الكامل واسم العيادة مطلوبون',
      }, { status: 400 });
    }

    // Validate username length
    if (username.length < 3) {
      return NextResponse.json({ error: 'اسم المستخدم يجب أن يكون ٣ أحرف على الأقل' }, { status: 400 });
    }

    // Validate password strength
    if (password.length < 6) {
      return NextResponse.json({ error: 'كلمة المرور يجب أن تكون ٦ أحرف على الأقل' }, { status: 400 });
    }

    // Check if username already exists
    const sanitizedUsername = sanitizeInput(username);
    const existingUser = await db.user.findUnique({ where: { username: sanitizedUsername } });
    if (existingUser) {
      return NextResponse.json({ error: 'اسم المستخدم مستخدم بالفعل' }, { status: 409 });
    }

    // Check if email already exists (if provided)
    if (email) {
      const existingEmail = await db.user.findUnique({ where: { email } });
      if (existingEmail) {
        return NextResponse.json({ error: 'البريد الإلكتروني مستخدم بالفعل' }, { status: 409 });
      }
    }

    // Generate booking slug from clinic name
    let bookingSlug = clinicName
      .replace(/\s+/g, '-')
      .replace(/[^\u0600-\u06FFa-zA-Z0-9-]/g, '')
      .toLowerCase();

    // Make slug unique
    const existingSlug = await db.clinic.findUnique({ where: { bookingSlug } });
    if (existingSlug) {
      bookingSlug = `${bookingSlug}-${Date.now().toString().slice(-4)}`;
    }

    // Create clinic
    const clinic = await db.clinic.create({
      data: {
        name: clinicName,
        phone: clinicPhone || null,
        address: clinicAddress || null,
        currency: clinicCurrency || 'SAR',
        paymentMode: 'partial',
        slotDuration: 15,
        bookingSlug,
        bookingEnabled: true,
      },
    });

    // Hash password and create admin user
    const hashedPassword = await hashPassword(password);
    const user = await db.user.create({
      data: {
        username: sanitizedUsername,
        passwordHash: hashedPassword,
        fullName,
        role: 'admin',
        phone: phone || null,
        email: email || null,
        clinicId: clinic.id,
        permissions: JSON.stringify({
          dashboard: true, patients: true, appointments: true,
          records: true, invoices: true, inventory: true,
          reports: true, settings: true,
        }),
        isActive: true,
        twoFactorEnabled: false,
        securityLevel: 'standard',
        lastPasswordChange: new Date(),
        emailVerified: false,
      },
    });

    // Create security config for clinic
    await db.securityConfig.create({
      data: {
        clinicId: clinic.id,
        maxLoginAttempts: 5,
        lockoutDurationMinutes: 30,
        passwordMinLength: 6,
        passwordRequireUppercase: false,
        passwordRequireLowercase: false,
        passwordRequireNumbers: false,
        passwordRequireSpecial: false,
        passwordExpiryDays: 90,
        sessionTimeoutMinutes: 480,
        refreshTokenExpiryDays: 30,
        requireTwoFactor: false,
        requireTwoFactorForAdmins: false,
        trustedDeviceExpiryDays: 30,
        maxConcurrentSessions: 5,
        maxApiKeysPerUser: 3,
        dataEncryptionEnabled: true,
        auditLogRetentionDays: 365,
        suspiciousActivityAlerts: true,
      },
    });

    // Create audit log
    await db.auditLog.create({
      data: {
        userId: user.id,
        userName: user.fullName,
        action: 'register',
        details: `تم تسجيل حساب جديد وإنشاء عيادة: ${clinicName}`,
      },
    });

    return NextResponse.json({
      message: 'تم إنشاء الحساب والعيادة بنجاح',
      username: sanitizedUsername,
      clinicName,
    }, { status: 201 });
  } catch (error) {
    console.error('Register error:', error);
    return NextResponse.json({ error: 'حدث خطأ في الخادم' }, { status: 500 });
  }
}
