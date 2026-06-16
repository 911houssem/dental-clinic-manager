import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { db } from '@/lib/db';
import { getAuthUser, getClientIP, getUserAgent, getDeviceInfo } from '@/lib/auth-helper';
import { generateAccessToken, generateRefreshToken, hashToken } from '@/lib/security';

// POST /api/auth/impersonate
// Body: { userId: string }
// Allows a super_admin (owner) to start a session as another user.
// Sets a separate `impersonator_id` cookie so the owner can return to their account.
export async function POST(request: NextRequest) {
  const ip = getClientIP(request);
  const ua = getUserAgent(request);
  const deviceInfo = getDeviceInfo(request);

  try {
    const authResult = await getAuthUser();
    if (!authResult) {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });
    }

    // Only the owner (super_admin) can impersonate
    if (authResult.user.role !== 'super_admin') {
      return NextResponse.json({ error: 'هذه الميزة متاحة فقط للمالك' }, { status: 403 });
    }

    const body = await request.json();
    const { userId } = body;
    if (!userId) {
      return NextResponse.json({ error: 'معرف المستخدم مطلوب' }, { status: 400 });
    }

    const targetUser = await db.user.findUnique({
      where: { id: userId },
      include: { clinic: true },
    });

    if (!targetUser) {
      return NextResponse.json({ error: 'المستخدم غير موجود' }, { status: 404 });
    }

    if (!targetUser.isActive) {
      return NextResponse.json({ error: 'حساب المستخدم غير نشط' }, { status: 400 });
    }

    // Prevent impersonating another super_admin (safety guard)
    if (targetUser.role === 'super_admin') {
      return NextResponse.json({ error: 'لا يمكن الدخول كمالك آخر' }, { status: 400 });
    }

    // Determine the clinic context for the impersonated user
    const clinicId = targetUser.clinicId || (await db.clinic.findFirst())?.id || null;

    // Create a session for the target user
    const sessionToken = generateAccessToken({
      userId: targetUser.id,
      sessionId: '',
      role: targetUser.role,
      clinicId,
      twoFactorVerified: targetUser.twoFactorEnabled,
    });

    const refreshToken = generateRefreshToken({
      userId: targetUser.id,
      sessionId: '',
    });

    const session = await db.session.create({
      data: {
        userId: targetUser.id,
        tokenHash: hashToken(sessionToken),
        refreshTokenHash: hashToken(refreshToken),
        deviceInfo: JSON.stringify(deviceInfo),
        ipAddress: ip,
        userAgent: ua,
        expiresAt: new Date(Date.now() + 8 * 60 * 60 * 1000), // 8 hours
      },
    });

    const finalAccessToken = generateAccessToken({
      userId: targetUser.id,
      sessionId: session.id,
      role: targetUser.role,
      clinicId,
      twoFactorVerified: targetUser.twoFactorEnabled,
    });

    const finalRefreshToken = generateRefreshToken({
      userId: targetUser.id,
      sessionId: session.id,
    });

    await db.session.update({
      where: { id: session.id },
      data: {
        tokenHash: hashToken(finalAccessToken),
        refreshTokenHash: hashToken(finalRefreshToken),
      },
    });

    // Audit + security logs
    await db.auditLog.create({
      data: {
        userId: targetUser.id,
        userName: targetUser.fullName,
        action: 'impersonate_login',
        details: `دخل المالك (${authResult.user.username}) إلى حساب ${targetUser.username} للمعاينة`,
      },
    });

    await db.securityLog.create({
      data: {
        userId: authResult.user.id,
        action: 'impersonate',
        severity: 'warning',
        details: `دخل المالك كـ ${targetUser.username} (${targetUser.role}) في العيادة ${targetUser.clinicId || 'بدون'}`,
        ipAddress: ip,
        userAgent: ua,
      },
    });

    const userData = {
      id: targetUser.id,
      username: targetUser.username,
      fullName: targetUser.fullName,
      role: targetUser.role,
      phone: targetUser.phone,
      email: targetUser.email,
      clinicId: targetUser.clinicId,
      permissions: targetUser.permissions ? JSON.parse(targetUser.permissions) : null,
      twoFactorEnabled: targetUser.twoFactorEnabled,
      securityLevel: targetUser.securityLevel,
      clinic: targetUser.clinic
        ? {
            id: targetUser.clinic.id,
            name: targetUser.clinic.name,
            phone: targetUser.clinic.phone,
            address: targetUser.clinic.address,
            currency: targetUser.clinic.currency,
          }
        : null,
    };

    const response = NextResponse.json({
      user: userData,
      currentClinicId: clinicId,
      impersonatorId: authResult.user.id,
      impersonatorName: authResult.user.fullName,
      message: `تم الدخول بنجاح كـ ${targetUser.fullName}`,
    });

    // Set new auth cookies
    response.cookies.set('access_token', finalAccessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 15 * 60, // 15 minutes
      path: '/',
    });

    response.cookies.set('refresh_token', finalRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 30 * 24 * 60 * 60, // 30 days
      path: '/',
    });

    response.cookies.set('clinic_current_id', clinicId || '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
    });

    // Persist the impersonator (owner) ID so we can return later
    response.cookies.set('impersonator_id', authResult.user.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60, // 1 hour (impersonation should be short)
      path: '/',
    });

    response.cookies.set('impersonator_name', encodeURIComponent(authResult.user.fullName), {
      httpOnly: false, // readable from JS so we can show a banner
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60,
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Impersonate error:', error);
    return NextResponse.json({ error: 'حدث خطأ في الخادم' }, { status: 500 });
  }
}

// DELETE /api/auth/impersonate
// Returns to the owner's account. Looks up the impersonator_id cookie, logs that user back in,
// and clears the impersonation cookies.
export async function DELETE(request: NextRequest) {
  const ip = getClientIP(request);
  const ua = getUserAgent(request);
  const deviceInfo = getDeviceInfo(request);

  try {
    const cookieStore = await cookies();
    const impersonatorId = cookieStore.get('impersonator_id')?.value;

    if (!impersonatorId) {
      return NextResponse.json({ error: 'لا يوجد حساب مالك للعودة إليه' }, { status: 400 });
    }

    const owner = await db.user.findUnique({
      where: { id: impersonatorId },
      include: { clinic: true },
    });

    if (!owner || owner.role !== 'super_admin') {
      return NextResponse.json({ error: 'حساب المالك غير موجود' }, { status: 404 });
    }

    const clinicId = (await db.clinic.findFirst())?.id || null;

    // Create session for the owner
    const sessionToken = generateAccessToken({
      userId: owner.id,
      sessionId: '',
      role: owner.role,
      clinicId,
      twoFactorVerified: owner.twoFactorEnabled,
    });

    const refreshToken = generateRefreshToken({
      userId: owner.id,
      sessionId: '',
    });

    const session = await db.session.create({
      data: {
        userId: owner.id,
        tokenHash: hashToken(sessionToken),
        refreshTokenHash: hashToken(refreshToken),
        deviceInfo: JSON.stringify(deviceInfo),
        ipAddress: ip,
        userAgent: ua,
        expiresAt: new Date(Date.now() + 8 * 60 * 60 * 1000),
      },
    });

    const finalAccessToken = generateAccessToken({
      userId: owner.id,
      sessionId: session.id,
      role: owner.role,
      clinicId,
      twoFactorVerified: owner.twoFactorEnabled,
    });

    const finalRefreshToken = generateRefreshToken({
      userId: owner.id,
      sessionId: session.id,
    });

    await db.session.update({
      where: { id: session.id },
      data: {
        tokenHash: hashToken(finalAccessToken),
        refreshTokenHash: hashToken(finalRefreshToken),
      },
    });

    await db.auditLog.create({
      data: {
        userId: owner.id,
        userName: owner.fullName,
        action: 'impersonate_return',
        details: 'عاد المالك إلى حسابه الأصلي',
      },
    });

    const userData = {
      id: owner.id,
      username: owner.username,
      fullName: owner.fullName,
      role: owner.role,
      phone: owner.phone,
      email: owner.email,
      clinicId: owner.clinicId,
      permissions: owner.permissions ? JSON.parse(owner.permissions) : null,
      twoFactorEnabled: owner.twoFactorEnabled,
      securityLevel: owner.securityLevel,
      clinic: owner.clinic
        ? {
            id: owner.clinic.id,
            name: owner.clinic.name,
            phone: owner.clinic.phone,
            address: owner.clinic.address,
            currency: owner.clinic.currency,
          }
        : null,
    };

    const response = NextResponse.json({
      user: userData,
      currentClinicId: clinicId,
      message: 'تم العودة إلى حساب المالك',
    });

    response.cookies.set('access_token', finalAccessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 15 * 60,
      path: '/',
    });

    response.cookies.set('refresh_token', finalRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
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

    // Clear impersonation cookies
    response.cookies.set('impersonator_id', '', { maxAge: 0, path: '/', httpOnly: true });
    response.cookies.set('impersonator_name', '', { maxAge: 0, path: '/' });

    return response;
  } catch (error) {
    console.error('Return-to-owner error:', error);
    return NextResponse.json({ error: 'حدث خطأ في الخادم' }, { status: 500 });
  }
}
