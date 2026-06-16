import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth-helper';
import { db } from '@/lib/db';
import { hashPassword, verifyPassword, validatePasswordStrength, isPasswordInHistory, addToPasswordHistory } from '@/lib/security';

export async function POST(request: NextRequest) {
  try {
    const authResult = await getAuthUser();
    if (!authResult) {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });
    }

    const { currentPassword, newPassword } = await request.json();

    if (!currentPassword || !newPassword) {
      return NextResponse.json({ error: 'كلمة المرور الحالية والجديدة مطلوبتان' }, { status: 400 });
    }

    const user = await db.user.findUnique({ where: { id: authResult.user.id } });
    if (!user) {
      return NextResponse.json({ error: 'المستخدم غير موجود' }, { status: 404 });
    }

    // Verify current password
    const isValid = await verifyPassword(currentPassword, user.passwordHash);
    if (!isValid) {
      return NextResponse.json({ error: 'كلمة المرور الحالية غير صحيحة' }, { status: 401 });
    }

    // Validate new password strength
    const strength = validatePasswordStrength(newPassword);
    if (!strength.valid) {
      return NextResponse.json({ error: strength.errors.join('. '), errors: strength.errors }, { status: 400 });
    }

    // Check password history
    const inHistory = await isPasswordInHistory(newPassword, user.passwordHistory);
    if (inHistory) {
      return NextResponse.json({ error: 'لا يمكنك استخدام كلمة مرور مستخدمة سابقاً' }, { status: 400 });
    }

    // Hash new password
    const newHash = await hashPassword(newPassword);
    const newHistory = await addToPasswordHistory(user.passwordHash, user.passwordHistory);

    // Update password
    await db.user.update({
      where: { id: user.id },
      data: {
        passwordHash: newHash,
        passwordHistory: newHistory,
        lastPasswordChange: new Date(),
        passwordChangeRequired: false,
      },
    });

    // Revoke all other sessions
    await db.session.updateMany({
      where: { userId: user.id, isRevoked: false, id: { not: authResult.sessionId } },
      data: { isRevoked: true },
    });

    // Create security log
    await db.securityLog.create({
      data: {
        userId: user.id,
        action: 'password_change',
        severity: 'warning',
        details: 'تم تغيير كلمة المرور - تم إلغاء الجلسات الأخرى',
        ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown',
      },
    });

    return NextResponse.json({ message: 'تم تغيير كلمة المرور بنجاح' });
  } catch (error) {
    console.error('Change password error:', error);
    return NextResponse.json({ error: 'حدث خطأ في الخادم' }, { status: 500 });
  }
}
