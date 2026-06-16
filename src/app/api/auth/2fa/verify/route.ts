import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth-helper';
import { db } from '@/lib/db';
import { verifyTOTP, sanitizeInput } from '@/lib/security';
import { checkRateLimit, RATE_LIMITS } from '@/lib/rate-limiter';

export async function POST(request: NextRequest) {
  try {
    const authResult = await getAuthUser();
    if (!authResult) {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });
    }

    const ip = request.headers.get('x-forwarded-for') || 'unknown';

    // Rate limit 2FA attempts
    const rateLimit = checkRateLimit(`2fa:${authResult.user.id}:${ip}`, RATE_LIMITS.twoFactor);
    if (!rateLimit.allowed) {
      return NextResponse.json({
        error: `تم تجاوز عدد المحاولات. حاول مرة أخرى بعد ${Math.ceil(rateLimit.resetIn / 60)} دقيقة`,
      }, { status: 429 });
    }

    const { code, enableBackupCodes } = await request.json();
    if (!code) {
      return NextResponse.json({ error: 'رمز التحقق مطلوب' }, { status: 400 });
    }

    const user = await db.user.findUnique({ where: { id: authResult.user.id } });
    if (!user || !user.twoFactorSecret) {
      return NextResponse.json({ error: 'لم يتم إعداد التحقق الثنائي' }, { status: 400 });
    }

    // Verify TOTP code
    const isValid = verifyTOTP(user.twoFactorSecret, code);
    if (!isValid) {
      await db.securityLog.create({
        data: {
          userId: user.id,
          action: '2fa_verify_failed',
          severity: 'warning',
          details: 'فشل التحقق من رمز 2FA',
          ipAddress: ip,
          userAgent: request.headers.get('user-agent') || 'unknown',
        },
      });
      return NextResponse.json({ error: 'رمز التحقق غير صحيح' }, { status: 401 });
    }

    // Enable 2FA
    await db.user.update({
      where: { id: user.id },
      data: {
        twoFactorEnabled: true,
        securityLevel: 'elevated',
      },
    });

    // Create security log
    await db.securityLog.create({
      data: {
        userId: user.id,
        action: '2fa_enabled',
        severity: 'info',
        details: 'تم تفعيل التحقق الثنائي',
        ipAddress: ip,
        userAgent: request.headers.get('user-agent') || 'unknown',
      },
    });

    return NextResponse.json({
      success: true,
      message: 'تم تفعيل التحقق الثنائي بنجاح',
      backupCodes: enableBackupCodes || [],
    });
  } catch (error) {
    console.error('2FA verify error:', error);
    return NextResponse.json({ error: 'حدث خطأ في الخادم' }, { status: 500 });
  }
}
