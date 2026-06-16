import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth-helper';
import { db } from '@/lib/db';
import { hashToken } from '@/lib/security';

export async function POST(request: NextRequest) {
  try {
    const authResult = await getAuthUser();

    // Revoke all sessions for this user
    if (authResult) {
      await db.session.updateMany({
        where: { userId: authResult.user.id, isRevoked: false },
        data: { isRevoked: true },
      });

      // Create security log
      await db.securityLog.create({
        data: {
          userId: authResult.user.id,
          action: 'logout',
          severity: 'info',
          details: 'تسجيل خروج وجلسات ملغاة',
          ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
          userAgent: request.headers.get('user-agent') || 'unknown',
        },
      });
    }

    const response = NextResponse.json({ message: 'تم تسجيل الخروج' });
    response.cookies.set('access_token', '', { maxAge: 0, path: '/', httpOnly: true, sameSite: 'strict' });
    response.cookies.set('refresh_token', '', { maxAge: 0, path: '/', httpOnly: true, sameSite: 'strict' });
    response.cookies.set('clinic_current_id', '', { maxAge: 0, path: '/' });
    return response;
  } catch (error) {
    console.error('Logout error:', error);
    const response = NextResponse.json({ message: 'تم تسجيل الخروج' });
    response.cookies.set('access_token', '', { maxAge: 0, path: '/', httpOnly: true });
    response.cookies.set('refresh_token', '', { maxAge: 0, path: '/', httpOnly: true });
    response.cookies.set('clinic_current_id', '', { maxAge: 0, path: '/' });
    return response;
  }
}
