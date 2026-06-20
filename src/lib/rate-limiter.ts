// ============== IN-MEMORY RATE LIMITER ==============
// Simplified for Vercel serverless (no setInterval, no persistent state)

interface RateLimitEntry {
  count: number;
  resetTime: number;
  blocked: boolean;
}

// Use globalThis to persist across calls in the same instance
const globalStore = globalThis as unknown as { 
  rateLimitStore?: Map<string, RateLimitEntry>;
  blockedIPs?: Set<string>;
};

if (!globalStore.rateLimitStore) globalStore.rateLimitStore = new Map();
if (!globalStore.blockedIPs) globalStore.blockedIPs = new Set();

const store = globalStore.rateLimitStore!;
const blockedIPs = globalStore.blockedIPs!;

export interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
  blockDurationMs: number;
}

export const RATE_LIMITS = {
  login: { windowMs: 15 * 60 * 1000, maxRequests: 10, blockDurationMs: 30 * 60 * 1000 },
  api: { windowMs: 60 * 1000, maxRequests: 100, blockDurationMs: 5 * 60 * 1000 },
};

export function checkRateLimit(key: string, config: RateLimitConfig) {
  const now = Date.now();
  const entry = store.get(key);

  if (entry && now > entry.resetTime) {
    store.delete(key);
  }

  if (blockedIPs.has(key.split(':')[1] || '')) {
    return { allowed: false, resetIn: 0 };
  }

  const current = store.get(key);
  if (current) {
    current.count++;
    if (current.count > config.maxRequests) {
      current.blocked = true;
      blockedIPs.add(key.split(':')[1] || '');
      return { allowed: false, resetIn: config.blockDurationMs };
    }
    return { allowed: true, resetIn: current.resetTime - now };
  }

  store.set(key, { count: 1, resetTime: now + config.windowMs, blocked: false });
  return { allowed: true, resetIn: config.windowMs };
}

export function isIPBlocked(ip: string): boolean {
  return blockedIPs.has(ip);
}

export function reportSuspiciousIP(ip: string, score: number = 1): void {
  // Simplified - just block immediately for high scores
  if (score >= 5) blockedIPs.add(ip);
}
