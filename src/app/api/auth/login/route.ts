import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyPassword, generateAccessToken, generateRefreshToken, hashToken } from '@/lib/security';
import { getClientIP, getUserAgent } from '@/lib/auth-helper';

export async function POST(request: NextRequest) {
  try {
    const ip = getClientIP(request);
    const ua = getUserAgent(request);

    const body = await request.json();
    const { username, password } = body;

    if (!username || !password) {
      return NextResponse.json({ error: 'اسم المستخدم وكلمة المرور مطلوبان' }, { status: 400 });
    }

    // Find user
    const user = await db.user.findFirst({
      where: { username, isActive: true },
    });

    if (!user) {
      return NextResponse.json({ error: 'خطأ في اسم المستخدم أو كلمة المرور' }, { status: 401 });
    }

    // Verify password
    const passwordValid = await verifyPassword(password, user.passwordHash);

    if (!passwordValid) {
      return NextResponse.json({ error: 'خطأ في اسم المستخدم أو كلمة المرور' }, { status: 401 });
    }

    // Get clinic ID
    const clinicId = user.role === 'super_admin'
      ? (await db.clinic.findFirst())?.id || null
      : user.clinicId;

    // Generate tokens
    const sessionToken = generateAccessToken({
      userId: user.id,
      sessionId: 's1',
      role: user.role,
      clinicId,
      twoFactorVerified: false,
    });

    const refreshToken = generateRefreshToken({
      userId: user.id,
      sessionId: 's1',
    });

    // Update last login
    await db.user.update({
      where: { id: user.id },
      data: { lastLogin: new Date() },
    }).catch(() => {});

    // Create audit log
    await db.auditLog.create({
      data: {
        userId: user.id,
        action: 'login',
        details: 'تسجيل دخول ناجح',
        userName: user.fullName,
      },
    }).catch(() => {});

    const userData = {
      id: user.id,
      username: user.username,
      fullName: user.fullName,
      role: user.role,
      phone: user.phone,
      email: user.email,
      clinicId: user.clinicId,
      permissions: user.permissions ? JSON.parse(user.permissions) : null,
      twoFactorEnabled: false,
      securityLevel: user.securityLevel || 'standard',
      clinic: null,
    };

    const response = NextResponse.json({
      user: userData,
      currentClinicId: clinicId,
    });

    // Set cookies
    response.cookies.set('access_token', sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 15 * 60,
      path: '/',
    });

    response.cookies.set('refresh_token', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60,
      path: '/',
    });

    response.cookies.set('clinic_current_id', clinicId || '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ error: 'حدث خطأ في الخادم' }, { status: 500 });
  }
}
