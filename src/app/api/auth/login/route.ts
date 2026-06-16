import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyPassword, hashPassword, generateAccessToken, generateRefreshToken, hashToken, verifyTOTP, isAccountLocked, getLockoutRemaining, MAX_LOGIN_ATTEMPTS, LOCKOUT_DURATION_MINUTES, generateDeviceFingerprint, generateAuthorizationCode, sanitizeInput } from '@/lib/security';
import { checkRateLimit, RATE_LIMITS, isIPBlocked, reportSuspiciousIP } from '@/lib/rate-limiter';
import { getClientIP, getUserAgent, getDeviceInfo } from '@/lib/auth-helper';

export async function POST(request: NextRequest) {
  const ip = getClientIP(request);
  const ua = getUserAgent(request);
  const deviceInfo = getDeviceInfo(request);

  try {
    // Check IP block
    if (isIPBlocked(ip)) {
      return NextResponse.json({ error: 'تم حظر هذا العنوان لأسباب أمنية' }, { status: 403 });
    }

    // Check rate limit
    const rateLimit = checkRateLimit(`login:${ip}`, RATE_LIMITS.login);
    if (!rateLimit.allowed) {
      return NextResponse.json({
        error: `تم تجاوز عدد المحاولات المسموحة. حاول مرة أخرى بعد ${Math.ceil(rateLimit.resetIn / 60)} دقيقة`,
        locked: true,
      }, { status: 429 });
    }

    const body = await request.json();
    const { username, password, twoFactorCode, trustDevice } = body;

    if (!username || !password) {
      return NextResponse.json({ error: 'اسم المستخدم وكلمة المرور مطلوبان' }, { status: 400 });
    }

    const sanitizedUsername = sanitizeInput(username);

    // Find user
    const user = await db.user.findFirst({
      where: { username: sanitizedUsername, isActive: true },
      include: { clinic: true },
    });

    // Record login attempt
    const createLoginAttempt = async (success: boolean, failureReason?: string) => {
      await db.loginAttempt.create({
        data: {
          userId: user?.id,
          username: sanitizedUsername,
          ipAddress: ip,
          userAgent: ua,
          success,
          failureReason,
        },
      });
    };

    if (!user) {
      reportSuspiciousIP(ip);
      await createLoginAttempt(false, 'user_not_found');
      return NextResponse.json({ error: 'خطأ في اسم المستخدم أو كلمة المرور' }, { status: 401 });
    }

    // Check account lock
    if (isAccountLocked(user.lockoutUntil)) {
      const remaining = getLockoutRemaining(user.lockoutUntil);
      await createLoginAttempt(false, 'account_locked');
      return NextResponse.json({
        error: `الحساب مقفل. حاول مرة أخرى بعد ${remaining} دقيقة`,
        locked: true,
        lockoutRemaining: remaining,
      }, { status: 423 });
    }

    // Verify password
    const passwordValid = await verifyPassword(password, user.passwordHash);

    if (!passwordValid) {
      const newAttempts = user.failedLoginAttempts + 1;
      const shouldLock = newAttempts >= MAX_LOGIN_ATTEMPTS;

      await db.user.update({
        where: { id: user.id },
        data: {
          failedLoginAttempts: newAttempts,
          accountLocked: shouldLock,
          lockoutUntil: shouldLock ? new Date(Date.now() + LOCKOUT_DURATION_MINUTES * 60000) : user.lockoutUntil,
        },
      });

      reportSuspiciousIP(ip);
      await createLoginAttempt(false, 'wrong_password');

      if (shouldLock) {
        // Create security log
        await db.securityLog.create({
          data: {
            userId: user.id,
            action: 'account_locked',
            severity: 'critical',
            details: `تم قفل الحساب بعد ${MAX_LOGIN_ATTEMPTS} محاولات فاشلة`,
            ipAddress: ip,
            userAgent: ua,
          },
        });

        return NextResponse.json({
          error: `تم قفل الحساب بعد ${MAX_LOGIN_ATTEMPTS} محاولات فاشلة. حاول مرة أخرى بعد ${LOCKOUT_DURATION_MINUTES} دقيقة`,
          locked: true,
          lockoutRemaining: LOCKOUT_DURATION_MINUTES,
        }, { status: 423 });
      }

      return NextResponse.json({
        error: `خطأ في كلمة المرور. محاولات متبقية: ${MAX_LOGIN_ATTEMPTS - newAttempts}`,
        attemptsRemaining: MAX_LOGIN_ATTEMPTS - newAttempts,
      }, { status: 401 });
    }

    // Password is correct - check if 2FA is required
    if (user.twoFactorEnabled) {
      if (!twoFactorCode) {
        // Return that 2FA is required, don't create session yet
        return NextResponse.json({
          requiresTwoFactor: true,
          userId: user.id,
          message: 'يرجى إدخال رمز التحقق الثنائي',
        });
      }

      // Verify 2FA code
      if (!user.twoFactorSecret || !verifyTOTP(user.twoFactorSecret, twoFactorCode)) {
        reportSuspiciousIP(ip, 3);
        await createLoginAttempt(false, 'invalid_2fa');
        await db.securityLog.create({
          data: {
            userId: user.id,
            action: 'invalid_2fa_attempt',
            severity: 'warning',
            details: 'محاولة تحقق ثنائي فاشلة',
            ipAddress: ip,
            userAgent: ua,
          },
        });
        return NextResponse.json({ error: 'رمز التحقق غير صحيح', requiresTwoFactor: true }, { status: 401 });
      }
    }

    // Check for new device (Steam Guard-like)
    const deviceFingerprint = generateDeviceFingerprint(ua, ip);
    const trustedDevice = await db.trustedDevice.findFirst({
      where: { userId: user.id, deviceFingerprint },
    });

    if (!trustedDevice && user.twoFactorEnabled) {
      // New device - require authorization (like Steam Guard email/code)
      const authCode = generateAuthorizationCode();
      await db.deviceAuthorization.create({
        data: {
          userId: user.id,
          deviceFingerprint,
          deviceName: `${deviceInfo.browser} on ${deviceInfo.os}`,
          deviceType: deviceInfo.deviceType,
          browser: deviceInfo.browser,
          os: deviceInfo.os,
          ipAddress: ip,
          isAuthorized: false,
          authorizationCode: authCode,
          expiresAt: new Date(Date.now() + 15 * 60 * 1000), // 15 min
        },
      });

      if (!twoFactorCode) {
        return NextResponse.json({
          requiresDeviceAuth: true,
          userId: user.id,
          deviceName: `${deviceInfo.browser} on ${deviceInfo.os}`,
          message: 'جهاز جديد! يرجى التحقق من رمز التفويض',
          // In production, this code would be sent via email/SMS
          // For demo, we'll include it in the response
          _demoAuthCode: authCode,
        });
      }
    }

    // Reset failed login attempts
    await db.user.update({
      where: { id: user.id },
      data: {
        failedLoginAttempts: 0,
        accountLocked: false,
        lockoutUntil: null,
        lastLogin: new Date(),
      },
    });

    // Create session
    const clinicId = user.role === 'super_admin'
      ? (await db.clinic.findFirst())?.id || null
      : user.clinicId;

    const sessionToken = generateAccessToken({
      userId: user.id,
      sessionId: '',
      role: user.role,
      clinicId,
      twoFactorVerified: user.twoFactorEnabled,
    });

    const refreshToken = generateRefreshToken({
      userId: user.id,
      sessionId: '',
    });

    // Create session in DB
    const session = await db.session.create({
      data: {
        userId: user.id,
        tokenHash: hashToken(sessionToken),
        refreshTokenHash: hashToken(refreshToken),
        deviceInfo: JSON.stringify(deviceInfo),
        ipAddress: ip,
        userAgent: ua,
        expiresAt: new Date(Date.now() + 8 * 60 * 60 * 1000), // 8 hours
      },
    });

    // Re-generate tokens with actual session ID
    const finalAccessToken = generateAccessToken({
      userId: user.id,
      sessionId: session.id,
      role: user.role,
      clinicId,
      twoFactorVerified: user.twoFactorEnabled,
    });

    const finalRefreshToken = generateRefreshToken({
      userId: user.id,
      sessionId: session.id,
    });

    // Update session with correct token hashes
    await db.session.update({
      where: { id: session.id },
      data: {
        tokenHash: hashToken(finalAccessToken),
        refreshTokenHash: hashToken(finalRefreshToken),
      },
    });

    // Trust device if requested
    if (trustDevice) {
      await db.trustedDevice.upsert({
        where: { deviceFingerprint },
        create: {
          userId: user.id,
          deviceFingerprint,
          deviceName: `${deviceInfo.browser} on ${deviceInfo.os}`,
          deviceType: deviceInfo.deviceType,
          browser: deviceInfo.browser,
          os: deviceInfo.os,
          ipAddress: ip,
          trustLevel: 'trusted',
          expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
        },
        update: {
          lastUsedAt: new Date(),
          ipAddress: ip,
        },
      });
    }

    // Create audit & security logs
    await db.auditLog.create({
      data: {
        userId: user.id,
        userName: user.fullName,
        action: 'login',
        details: 'تسجيل دخول ناجح',
      },
    });

    await db.securityLog.create({
      data: {
        userId: user.id,
        action: 'login',
        severity: 'info',
        details: `تسجيل دخول من ${deviceInfo.browser}/${deviceInfo.os}`,
        ipAddress: ip,
        userAgent: ua,
        deviceInfo: JSON.stringify(deviceInfo),
      },
    });

    // Check for suspicious activity (multiple sessions)
    const activeSessions = await db.session.count({
      where: { userId: user.id, isRevoked: false, expiresAt: { gt: new Date() } },
    });

    if (activeSessions > 3) {
      await db.securityLog.create({
        data: {
          userId: user.id,
          action: 'multiple_sessions',
          severity: 'warning',
          details: `${activeSessions} جلسة نشطة للحساب`,
          ipAddress: ip,
        },
      });
    }

    const userData = {
      id: user.id,
      username: user.username,
      fullName: user.fullName,
      role: user.role,
      phone: user.phone,
      email: user.email,
      clinicId: user.clinicId,
      permissions: user.permissions ? JSON.parse(user.permissions) : null,
      twoFactorEnabled: user.twoFactorEnabled,
      securityLevel: user.securityLevel,
      clinic: user.clinic,
    };

    const response = NextResponse.json({
      user: userData,
      currentClinicId: clinicId,
    });

    // Set secure cookies
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

    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ error: 'حدث خطأ في الخادم' }, { status: 500 });
  }
}
