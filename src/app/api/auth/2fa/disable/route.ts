import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth-helper';
import { db } from '@/lib/db';
import { verifyTOTP, sanitizeInput } from '@/lib/security';

export async function POST(request: NextRequest) {
  try {
    const authResult = await getAuthUser();
    if (!authResult) {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });
    }

    const { password, twoFactorCode } = await request.json();
    if (!password) {
      return NextResponse.json({ error: 'كلمة المرور مطلوبة لتعطيل التحقق الثنائي' }, { status: 400 });
    }

    const user = await db.user.findUnique({ where: { id: authResult.user.id } });
    if (!user || !user.twoFactorEnabled) {
      return NextResponse.json({ error: 'التحقق الثنائي غير مفعل' }, { status: 400 });
    }

    // Verify 2FA code
    if (twoFactorCode && user.twoFactorSecret) {
      const isValid = verifyTOTP(user.twoFactorSecret, twoFactorCode);
      if (!isValid) {
        return NextResponse.json({ error: 'رمز التحقق غير صحيح' }, { status: 401 });
      }
    } else {
      return NextResponse.json({ error: 'رمز التحقق الثنائي مطلوب' }, { status: 400 });
    }

    // Disable 2FA
    await db.user.update({
      where: { id: user.id },
      data: {
        twoFactorEnabled: false,
        twoFactorSecret: null,
        securityLevel: 'standard',
      },
    });

    // Remove all trusted devices (force re-authentication)
    await db.trustedDevice.deleteMany({
      where: { userId: user.id },
    });

    // Revoke all other sessions
    await db.session.updateMany({
      where: { userId: user.id, isRevoked: false },
      data: { isRevoked: true },
    });

    // Create security log
    await db.securityLog.create({
      data: {
        userId: user.id,
        action: '2fa_disabled',
        severity: 'critical',
        details: 'تم تعطيل التحقق الثنائي - يجب إعادة تسجيل الدخول',
        ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown',
      },
    });

    return NextResponse.json({
      success: true,
      message: 'تم تعطيل التحقق الثنائي. يرجى تسجيل الدخول مرة أخرى.',
    });
  } catch (error) {
    console.error('2FA disable error:', error);
    return NextResponse.json({ error: 'حدث خطأ في الخادم' }, { status: 500 });
  }
}
