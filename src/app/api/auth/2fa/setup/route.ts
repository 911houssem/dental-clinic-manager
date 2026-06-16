import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth-helper';
import { db } from '@/lib/db';
import { generateTwoFactorSecret, generateTOTP, generateBackupCodes, hashToken, sanitizeInput } from '@/lib/security';

export async function POST(request: NextRequest) {
  try {
    const authResult = await getAuthUser();
    if (!authResult) {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });
    }

    const user = await db.user.findUnique({ where: { id: authResult.user.id } });
    if (!user) {
      return NextResponse.json({ error: 'المستخدم غير موجود' }, { status: 404 });
    }

    if (user.twoFactorEnabled) {
      return NextResponse.json({ error: 'التحقق الثنائي مفعل بالفعل' }, { status: 400 });
    }

    // Generate 2FA secret
    const secret = generateTwoFactorSecret();
    const backupCodes = generateBackupCodes(10);

    // Store secret temporarily (not yet enabled until verified)
    await db.user.update({
      where: { id: user.id },
      data: {
        twoFactorSecret: secret,
      },
    });

    // Generate current TOTP for verification
    const currentCode = generateTOTP(secret);

    // Create security log
    await db.securityLog.create({
      data: {
        userId: user.id,
        action: '2fa_setup_initiated',
        severity: 'info',
        details: 'بدء إعداد التحقق الثنائي',
        ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown',
      },
    });

    // Return setup data (in production, generate QR code URL)
    // For TOTP apps, the URI format is: otpauth://totp/ClinicApp:username?secret=BASE32SECRET&issuer=ClinicApp
    const otpauthUrl = `otpauth://totp/عيادة:${user.username}?secret=${Buffer.from(secret, 'base64').toString('base64')}&issuer=عيادة`;

    return NextResponse.json({
      secret,
      currentCode, // Demo: show current code for verification
      backupCodes,
      otpauthUrl,
      message: 'أدخل الرمز من تطبيق المصادقة لتفعيل التحقق الثنائي',
    });
  } catch (error) {
    console.error('2FA setup error:', error);
    return NextResponse.json({ error: 'حدث خطأ في الخادم' }, { status: 500 });
  }
}
