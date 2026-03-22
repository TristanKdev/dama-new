/**
 * Simple in-memory rate limiter for API routes.
 * In production with multiple instances, replace with Redis-based rate limiting.
 */

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const store = new Map<string, RateLimitEntry>();

// Clean up expired entries periodically to prevent memory leaks
const CLEANUP_INTERVAL = 60_000; // 1 minute
let lastCleanup = Date.now();

function cleanup() {
  const now = Date.now();
  if (now - lastCleanup < CLEANUP_INTERVAL) return;
  lastCleanup = now;
  for (const [key, entry] of store) {
    if (now > entry.resetAt) {
      store.delete(key);
    }
  }
}

interface RateLimitConfig {
  /** Max requests allowed in the window */
  limit: number;
  /** Window duration in seconds */
  windowSeconds: number;
}

interface RateLimitResult {
  success: boolean;
  remaining: number;
  resetAt: number;
}

/**
 * Check rate limit for a given identifier (typically IP address).
 */
export function checkRateLimit(
  identifier: string,
  config: RateLimitConfig
): RateLimitResult {
  cleanup();

  const now = Date.now();
  const key = identifier;
  const entry = store.get(key);

  if (!entry || now > entry.resetAt) {
    // First request or window expired — reset
    store.set(key, {
      count: 1,
      resetAt: now + config.windowSeconds * 1000,
    });
    return { success: true, remaining: config.limit - 1, resetAt: now + config.windowSeconds * 1000 };
  }

  if (entry.count >= config.limit) {
    return { success: false, remaining: 0, resetAt: entry.resetAt };
  }

  entry.count++;
  return { success: true, remaining: config.limit - entry.count, resetAt: entry.resetAt };
}

/**
 * Get client IP from request headers.
 * Works with common proxies (Vercel, Cloudflare, nginx).
 */
export function getClientIp(request: Request): string {
  const headers = request.headers;
  return (
    headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    headers.get('x-real-ip') ||
    headers.get('cf-connecting-ip') ||
    'unknown'
  );
}

// Pre-configured rate limits for different endpoint types
export const RATE_LIMITS = {
  /** Public form submissions: 5 per minute */
  form: { limit: 5, windowSeconds: 60 },
  /** Order lookup: 10 per minute */
  lookup: { limit: 10, windowSeconds: 60 },
  /** Payment sessions: 10 per minute */
  payment: { limit: 10, windowSeconds: 60 },
  /** Address check: 20 per minute */
  addressCheck: { limit: 20, windowSeconds: 60 },
  /** Public read endpoints (FAQs, delivery dates): 30 per minute */
  publicRead: { limit: 30, windowSeconds: 60 },
} as const;
