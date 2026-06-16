import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';

// ============== CONFIGURATION ==============
// Use stable secrets to survive hot reloads - in production, always set env vars
const JWT_SECRET = process.env.JWT_SECRET || 'clinic-jwt-secret-stable-key-2024-aes256-encryption';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'clinic-refresh-secret-stable-key-2024-aes256-encryption';
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef';
const ENCRYPTION_IV_LENGTH = 16;

const ACCESS_TOKEN_EXPIRY = '15m';
const REFRESH_TOKEN_EXPIRY = '30d';

// ============== PASSWORD SECURITY ==============
const SALT_ROUNDS = 12;

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function validatePasswordStrength(password: string): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  if (password.length < 8) errors.push('كلمة المرور يجب أن تكون 8 أحرف على الأقل');
  if (!/[A-Z]/.test(password)) errors.push('يجب أن تحتوي على حرف كبير واحد على الأقل');
  if (!/[a-z]/.test(password)) errors.push('يجب أن تحتوي على حرف صغير واحد على الأقل');
  if (!/[0-9]/.test(password)) errors.push('يجب أن تحتوي على رقم واحد على الأقل');
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) errors.push('يجب أن تحتوي على رمز خاص واحد على الأقل');
  return { valid: errors.length === 0, errors };
}

export async function isPasswordInHistory(password: string, historyJson: string | null): Promise<boolean> {
  if (!historyJson) return false;
  try {
    const hashes: string[] = JSON.parse(historyJson);
    for (const hash of hashes) {
      if (await bcrypt.compare(password, hash)) return true;
    }
  } catch { /* ignore */ }
  return false;
}

export async function addToPasswordHistory(hash: string, historyJson: string | null, maxHistory: number = 5): Promise<string> {
  let hashes: string[] = [];
  if (historyJson) {
    try { hashes = JSON.parse(historyJson); } catch { /* ignore */ }
  }
  hashes.unshift(hash);
  if (hashes.length > maxHistory) hashes = hashes.slice(0, maxHistory);
  return JSON.stringify(hashes);
}

// ============== JWT TOKENS ==============
interface TokenPayload {
  userId: string;
  sessionId: string;
  role: string;
  clinicId?: string | null;
  twoFactorVerified?: boolean;
}

export function generateAccessToken(payload: TokenPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: ACCESS_TOKEN_EXPIRY });
}

export function generateRefreshToken(payload: { userId: string; sessionId: string }): string {
  return jwt.sign(payload, JWT_REFRESH_SECRET, { expiresIn: REFRESH_TOKEN_EXPIRY });
}

export function verifyAccessToken(token: string): TokenPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as TokenPayload;
  } catch {
    return null;
  }
}

export function verifyRefreshToken(token: string): { userId: string; sessionId: string } | null {
  try {
    return jwt.verify(token, JWT_REFRESH_SECRET) as { userId: string; sessionId: string };
  } catch {
    return null;
  }
}

export function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}

// ============== ENCRYPTION (AES-256-GCM) ==============
export function encrypt(text: string): string {
  const iv = crypto.randomBytes(ENCRYPTION_IV_LENGTH);
  const key = Buffer.from(ENCRYPTION_KEY.slice(0, 64), 'hex');
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  const authTag = cipher.getAuthTag().toString('hex');
  return iv.toString('hex') + ':' + authTag + ':' + encrypted;
}

export function decrypt(encryptedText: string): string {
  const parts = encryptedText.split(':');
  if (parts.length !== 3) throw new Error('Invalid encrypted text format');
  const iv = Buffer.from(parts[0], 'hex');
  const authTag = Buffer.from(parts[1], 'hex');
  const encrypted = parts[2];
  const key = Buffer.from(ENCRYPTION_KEY.slice(0, 64), 'hex');
  const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
  decipher.setAuthTag(authTag);
  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}

// ============== TOTP 2FA (Steam Guard-like) ==============
export function generateTwoFactorSecret(): string {
  return crypto.randomBytes(20).toString('base64');
}

export function generateTOTP(secret: string, timeStep: number = 30, digits: number = 6): string {
  const time = Math.floor(Date.now() / 1000 / timeStep);
  const timeBuffer = Buffer.alloc(8);
  timeBuffer.writeBigUInt64BE(BigInt(time));

  const secretBuffer = Buffer.from(secret, 'base64');
  const hmac = crypto.createHmac('sha1', secretBuffer);
  hmac.update(timeBuffer);
  const hmacResult = hmac.digest();

  const offset = hmacResult[hmacResult.length - 1] & 0x0f;
  const binary =
    ((hmacResult[offset] & 0x7f) << 24) |
    ((hmacResult[offset + 1] & 0xff) << 16) |
    ((hmacResult[offset + 2] & 0xff) << 8) |
    (hmacResult[offset + 3] & 0xff);

  const otp = binary % Math.pow(10, digits);
  return otp.toString().padStart(digits, '0');
}

export function verifyTOTP(secret: string, code: string, window: number = 1): boolean {
  // Check current and adjacent time windows to account for clock drift
  for (let i = -window; i <= window; i++) {
    const time = Math.floor(Date.now() / 1000 / 30) + i;
    const timeBuffer = Buffer.alloc(8);
    timeBuffer.writeBigUInt64BE(BigInt(time));

    const secretBuffer = Buffer.from(secret, 'base64');
    const hmac = crypto.createHmac('sha1', secretBuffer);
    hmac.update(timeBuffer);
    const hmacResult = hmac.digest();

    const offset = hmacResult[hmacResult.length - 1] & 0x0f;
    const binary =
      ((hmacResult[offset] & 0x7f) << 24) |
      ((hmacResult[offset + 1] & 0xff) << 16) |
      ((hmacResult[offset + 2] & 0xff) << 8) |
      (hmacResult[offset + 3] & 0xff);

    const otp = binary % 1000000;
    if (otp.toString().padStart(6, '0') === code) return true;
  }
  return false;
}

export function generateBackupCodes(count: number = 10): string[] {
  const codes: string[] = [];
  for (let i = 0; i < count; i++) {
    codes.push(crypto.randomBytes(4).toString('hex').toUpperCase());
  }
  return codes;
}

// ============== DEVICE FINGERPRINTING ==============
export function generateDeviceFingerprint(userAgent: string, ip: string): string {
  const data = `${userAgent}|${ip}`;
  return crypto.createHash('sha256').update(data).digest('hex');
}

export function parseUserAgent(ua: string): { browser: string; os: string; deviceType: string } {
  let browser = 'Unknown';
  let os = 'Unknown';
  let deviceType = 'desktop';

  if (ua.includes('Firefox/')) browser = 'Firefox';
  else if (ua.includes('Edg/')) browser = 'Edge';
  else if (ua.includes('Chrome/')) browser = 'Chrome';
  else if (ua.includes('Safari/') && !ua.includes('Chrome')) browser = 'Safari';

  if (ua.includes('Windows')) os = 'Windows';
  else if (ua.includes('Mac OS')) os = 'macOS';
  else if (ua.includes('Linux')) os = 'Linux';
  else if (ua.includes('Android')) { os = 'Android'; deviceType = 'mobile'; }
  else if (ua.includes('iPhone') || ua.includes('iPad')) { os = 'iOS'; deviceType = ua.includes('iPad') ? 'tablet' : 'mobile'; }

  if (ua.includes('Mobile') || ua.includes('Android')) deviceType = 'mobile';
  if (ua.includes('iPad') || ua.includes('Tablet')) deviceType = 'tablet';

  return { browser, os, deviceType };
}

// ============== CSRF PROTECTION ==============
export function generateCSRFToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

export function validateCSRFToken(token: string, expectedToken: string): boolean {
  if (!token || !expectedToken) return false;
  return crypto.timingSafeEqual(Buffer.from(token), Buffer.from(expectedToken));
}

// ============== INPUT SANITIZATION ==============
export function sanitizeInput(input: string): string {
  return input
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .replace(/['";\\]/g, '') // Remove SQL injection chars
    .trim();
}

export function sanitizeObject<T extends Record<string, any>>(obj: T): T {
  const sanitized = { ...obj };
  for (const key of Object.keys(sanitized)) {
    if (typeof sanitized[key] === 'string') {
      sanitized[key] = sanitizeInput(sanitized[key]);
    }
  }
  return sanitized;
}

// ============== SECURITY HEADERS ==============
export const securityHeaders = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
  'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; font-src 'self' data:;",
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
};

// ============== RANDOM GENERATORS ==============
export function generateSecureToken(length: number = 32): string {
  return crypto.randomBytes(length).toString('hex');
}

export function generateAuthorizationCode(): string {
  return crypto.randomBytes(3).toString('hex').toUpperCase(); // 6-char code like Steam Guard
}

// ============== ACCOUNT LOCKOUT ==============
export const MAX_LOGIN_ATTEMPTS = 5;
export const LOCKOUT_DURATION_MINUTES = 30;

export function isAccountLocked(lockoutUntil: Date | null): boolean {
  if (!lockoutUntil) return false;
  return new Date(lockoutUntil) > new Date();
}

export function getLockoutRemaining(lockoutUntil: Date | null): number {
  if (!lockoutUntil) return 0;
  const remaining = new Date(lockoutUntil).getTime() - Date.now();
  return Math.max(0, Math.ceil(remaining / 60000));
}
