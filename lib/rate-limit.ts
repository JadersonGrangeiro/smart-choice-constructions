// Simple in-memory rate limiter. Works per serverless instance.
// For multi-instance production, swap the Map for Upstash Redis.

interface Entry { count: number; reset: number }
const store = new Map<string, Entry>();

// Prune old entries every 5 minutes to avoid memory leaks
setInterval(() => {
  const now = Date.now();
  for (const [k, v] of store) if (now > v.reset) store.delete(k);
}, 5 * 60 * 1000);

export interface RateLimitResult {
  ok: boolean;
  remaining: number;
  retryAfter?: number; // seconds until reset (only when ok=false)
}

/**
 * @param key      Unique identifier — use IP address
 * @param limit    Max requests per window
 * @param windowMs Window size in milliseconds
 */
export function rateLimit(key: string, limit: number, windowMs: number): RateLimitResult {
  const now = Date.now();
  const entry = store.get(key);

  if (!entry || now > entry.reset) {
    store.set(key, { count: 1, reset: now + windowMs });
    return { ok: true, remaining: limit - 1 };
  }

  if (entry.count >= limit) {
    return { ok: false, remaining: 0, retryAfter: Math.ceil((entry.reset - now) / 1000) };
  }

  entry.count++;
  return { ok: true, remaining: limit - entry.count };
}

/** Extract best-effort IP from request headers (works on Vercel). */
export function getIp(request: Request): string {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0].trim() ??
    request.headers.get("x-real-ip") ??
    "unknown"
  );
}
