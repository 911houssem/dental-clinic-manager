import { cookies } from 'next/headers';
import { db } from '@/lib/db';
import { verifyAccessToken, verifyRefreshToken, hashToken, parseUserAgent } from './security';

export interface AuthResult {
  user: {
    id: string;
    username: string;
    fullName: string;
    role: string;
    phone?: string | null;
    email?: string | null;
    clinicId?: string | null;
    permissions: Record<string, boolean> | null;
    twoFactorEnabled: boolean;
    securityLevel: string;
    clinic?: { id: string; name: string; phone?: string; address?: string; currency: string } | null;
  };
  currentClinicId: string | null;
  sessionId: string;
}

// Convenience accessors
export function authUserId(auth: AuthResult): string { return auth.user.id; }
export function authUserRole(auth: AuthResult): string { return auth.user.role; }
export function authUserClinicId(auth: AuthResult): string | null | undefined { return auth.user.clinicId; }

export async function getAuthUser(): Promise<AuthResult | null> {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get('access_token')?.value;
  const refreshToken = cookieStore.get('refresh_token')?.value;

  if (!accessToken) return null;

  // Verify access token
  const payload = verifyAccessToken(accessToken);
  if (!payload) return null;

  // Check session exists and is not revoked
  const tokenHash = hashToken(accessToken);
  const session = await db.session.findFirst({
    where: { tokenHash, isRevoked: false, expiresAt: { gt: new Date() } },
  });

  if (!session) return null;

  // Get user
  const user = await db.user.findUnique({
    where: { id: payload.userId },
    include: { clinic: true },
  });

  if (!user || !user.isActive) return null;

  // Check account lock
  if (user.accountLocked && user.lockoutUntil && new Date(user.lockoutUntil) > new Date()) {
    return null;
  }

  // Update session last accessed
  await db.session.update({
    where: { id: session.id },
    data: { lastAccessedAt: new Date() },
  }).catch(() => {});

  const clinicId = user.role === 'super_admin'
    ? (cookieStore.get('clinic_current_id')?.value || null)
    : user.clinicId;

  return {
    user: {
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
    },
    currentClinicId: clinicId,
    sessionId: session.id,
  };
}

export function getClientIP(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const realIP = request.headers.get('x-real-ip');
  if (forwarded) return forwarded.split(',')[0].trim();
  if (realIP) return realIP.trim();
  return 'unknown';
}

export function getUserAgent(request: Request): string {
  return request.headers.get('user-agent') || 'unknown';
}

export function getDeviceInfo(request: Request) {
  const ua = getUserAgent(request);
  const ip = getClientIP(request);
  const parsed = parseUserAgent(ua);
  return {
    userAgent: ua,
    ipAddress: ip,
    browser: parsed.browser,
    os: parsed.os,
    deviceType: parsed.deviceType,
  };
}
