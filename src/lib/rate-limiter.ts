// ============== IN-MEMORY RATE LIMITER ==============
// Production would use Redis, but for this implementation we use in-memory store

interface RateLimitEntry {
  count: number;
  resetTime: number;
  blocked: boolean;
}

const store = new Map<string, RateLimitEntry>();

// Cleanup expired entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of store.entries()) {
    if (now > entry.resetTime) {
      store.delete(key);
    }
  }
}, 5 * 60 * 1000);

export interface RateLimitConfig {
  windowMs: number;       // Time window in milliseconds
  maxRequests: number;    // Max requests per window
  blockDurationMs: number; // How long to block after exceeding
}

export const RATE_LIMITS = {
  // Login attempts: 5 per 15 minutes, then block for 30 minutes
  login: { windowMs: 15 * 60 * 1000, maxRequests: 5, blockDurationMs: 30 * 60 * 1000 },
  // API general: 100 per minute
  api: { windowMs: 60 * 1000, maxRequests: 100, blockDurationMs: 5 * 60 * 1000 },
  // 2FA verification: 3 per 5 minutes
  twoFactor: { windowMs: 5 * 60 * 1000, maxRequests: 3, blockDurationMs: 15 * 60 * 1000 },
  // Password reset: 3 per hour
  passwordReset: { windowMs: 60 * 60 * 1000, maxRequests: 3, blockDurationMs: 60 * 60 * 1000 },
  // Session creation: 10 per hour
  sessionCreate: { windowMs: 60 * 60 * 1000, maxRequests: 10, blockDurationMs: 30 * 60 * 1000 },
  // Data export: 5 per hour
  dataExport: { windowMs: 60 * 60 * 1000, maxRequests: 5, blockDurationMs: 60 * 60 * 1000 },
  // Registration: 3 per hour per IP
  registration: { windowMs: 60 * 60 * 1000, maxRequests: 3, blockDurationMs: 60 * 60 * 1000 },
};

export function checkRateLimit(key: string, config: RateLimitConfig): { allowed: boolean; remaining: number; resetIn: number; blocked: boolean } {
  const now = Date.now();
  const entry = store.get(key);

  // If blocked and still within block duration
  if (entry?.blocked && now < entry.resetTime) {
    return {
      allowed: false,
      remaining: 0,
      resetIn: Math.ceil((entry.resetTime - now) / 1000),
      blocked: true,
    };
  }

  // If no entry or window expired, create new entry
  if (!entry || now > entry.resetTime) {
    store.set(key, {
      count: 1,
      resetTime: now + config.windowMs,
      blocked: false,
    });
    return {
      allowed: true,
      remaining: config.maxRequests - 1,
      resetIn: Math.ceil(config.windowMs / 1000),
      blocked: false,
    };
  }

  // Increment count
  entry.count++;

  // Check if exceeded
  if (entry.count > config.maxRequests) {
    entry.blocked = true;
    entry.resetTime = now + config.blockDurationMs;
    return {
      allowed: false,
      remaining: 0,
      resetIn: Math.ceil(config.blockDurationMs / 1000),
      blocked: true,
    };
  }

  return {
    allowed: true,
    remaining: config.maxRequests - entry.count,
    resetIn: Math.ceil((entry.resetTime - now) / 1000),
    blocked: false,
  };
}

// ============== IP-BASED SECURITY ==============
const blockedIPs = new Set<string>();
const suspiciousIPs = new Map<string, number>(); // IP -> suspicious score

export function blockIP(ip: string): void {
  blockedIPs.add(ip);
}

export function unblockIP(ip: string): void {
  blockedIPs.delete(ip);
}

export function isIPBlocked(ip: string): boolean {
  return blockedIPs.has(ip);
}

export function reportSuspiciousIP(ip: string, score: number = 1): void {
  const current = suspiciousIPs.get(ip) || 0;
  const newScore = current + score;
  suspiciousIPs.set(ip, newScore);
  // Auto-block after 10 suspicious activities
  if (newScore >= 10) {
    blockIP(ip);
  }
}

export function getSuspiciousScore(ip: string): number {
  return suspiciousIPs.get(ip) || 0;
}

// ============== DEVICE-BASED RATE LIMITING ==============
const deviceAttempts = new Map<string, number>();

export function recordDeviceAttempt(deviceId: string): void {
  const count = deviceAttempts.get(deviceId) || 0;
  deviceAttempts.set(deviceId, count + 1);
}

export function getDeviceAttemptCount(deviceId: string): number {
  return deviceAttempts.get(deviceId) || 0;
}

export function resetDeviceAttempts(deviceId: string): void {
  deviceAttempts.delete(deviceId);
}
