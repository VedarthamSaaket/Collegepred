/**
 * Simple in-memory rate limiter for API endpoints.
 * In production, replace with Redis-based solution.
 */
const rateMap = new Map<string, { count: number; resetAt: number }>();

interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
}

const defaults: Record<string, RateLimitConfig> = {
  login: { maxRequests: 5, windowMs: 60_000 },       // 5 attempts per minute
  signup: { maxRequests: 3, windowMs: 60_000 },       // 3 signups per minute
  api: { maxRequests: 60, windowMs: 60_000 },          // 60 requests per minute
  discuss: { maxRequests: 10, windowMs: 60_000 },      // 10 posts per minute
  predict: { maxRequests: 30, windowMs: 60_000 },      // 30 predictions per minute
};

export function getRateLimitKey(identifier: string, type: keyof typeof defaults = 'api'): string {
  return `${type}:${identifier}`;
}

export function checkRateLimit(
  key: string,
  type: keyof typeof defaults = 'api'
): { allowed: boolean; remaining: number; resetAt: number } {
  const config = defaults[type]!;
  const now = Date.now();

  let entry = rateMap.get(key);

  if (!entry || now >= entry.resetAt) {
    entry = { count: 1, resetAt: now + config.windowMs };
    rateMap.set(key, entry);
    return { allowed: true, remaining: config.maxRequests - 1, resetAt: entry.resetAt };
  }

  entry.count++;
  if (entry.count > config.maxRequests) {
    return { allowed: false, remaining: 0, resetAt: entry.resetAt };
  }

  return { allowed: true, remaining: config.maxRequests - entry.count, resetAt: entry.resetAt };
}

export function clearRateLimit(key: string): void {
  rateMap.delete(key);
}

// Periodically clean up stale entries to prevent memory leaks
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of rateMap.entries()) {
    if (now >= entry.resetAt) {
      rateMap.delete(key);
    }
  }
}, 60_000);