import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth-helper';
import { db } from '@/lib/db';

// GET: List all active sessions for current user
export async function GET(request: NextRequest) {
  try {
    const authResult = await getAuthUser();
    if (!authResult) {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });
    }

    const sessions = await db.session.findMany({
      where: { userId: authResult.user.id, isRevoked: false, expiresAt: { gt: new Date() } },
      orderBy: { lastAccessedAt: 'desc' },
    });

    const formattedSessions = sessions.map(s => {
      let deviceInfoParsed: any = {};
      try { deviceInfoParsed = JSON.parse(s.deviceInfo || '{}'); } catch {}

      return {
        id: s.id,
        isCurrent: s.id === authResult.sessionId,
        deviceInfo: deviceInfoParsed,
        ipAddress: s.ipAddress,
        lastAccessedAt: s.lastAccessedAt,
        createdAt: s.createdAt,
        expiresAt: s.expiresAt,
      };
    });

    return NextResponse.json({ sessions: formattedSessions });
  } catch (error) {
    console.error('Sessions list error:', error);
    return NextResponse.json({ error: 'حدث خطأ في الخادم' }, { status: 500 });
  }
}

// DELETE: Revoke a session or all sessions
export async function DELETE(request: NextRequest) {
  try {
    const authResult = await getAuthUser();
    if (!authResult) {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });
    }

    const { sessionId, revokeAll } = await request.json();

    if (revokeAll) {
      // Revoke all sessions except current
      await db.session.updateMany({
        where: {
          userId: authResult.user.id,
          isRevoked: false,
          id: { not: authResult.sessionId },
        },
        data: { isRevoked: true },
      });

      await db.securityLog.create({
        data: {
          userId: authResult.user.id,
          action: 'all_sessions_revoked',
          severity: 'warning',
          details: 'تم إلغاء جميع الجلسات الأخرى',
          ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
        },
      });

      return NextResponse.json({ message: 'تم إلغاء جميع الجلسات الأخرى' });
    }

    if (sessionId) {
      // Revoke specific session
      const session = await db.session.findFirst({
        where: { id: sessionId, userId: authResult.user.id },
      });

      if (!session) {
        return NextResponse.json({ error: 'الجلسة غير موجودة' }, { status: 404 });
      }

      if (session.id === authResult.sessionId) {
        return NextResponse.json({ error: 'لا يمكنك إلغاء الجلسة الحالية' }, { status: 400 });
      }

      await db.session.update({
        where: { id: sessionId },
        data: { isRevoked: true },
      });

      await db.securityLog.create({
        data: {
          userId: authResult.user.id,
          action: 'session_revoked',
          severity: 'info',
          details: `تم إلغاء جلسة من ${session.ipAddress}`,
          ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
        },
      });

      return NextResponse.json({ message: 'تم إلغاء الجلسة' });
    }

    return NextResponse.json({ error: 'معرف الجلسة مطلوب' }, { status: 400 });
  } catch (error) {
    console.error('Session revoke error:', error);
    return NextResponse.json({ error: 'حدث خطأ في الخادم' }, { status: 500 });
  }
}
