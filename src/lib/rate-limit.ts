import "server-only";

// Tiny in-process rate limiter. Good enough for forgot-password + similar
// low-traffic endpoints on a single Vercel instance; in a multi-region
// fluid-compute world the limits effectively become per-instance which
// is fine for "no one should hit this 30 times per hour" thresholds.
//
// For real cross-instance limits behind a CDN, upgrade to Upstash Redis or
// Vercel KV — same interface, just swap the impl.

interface Bucket {
  count: number;
  resetAt: number;
}

const BUCKETS = new Map<string, Bucket>();
const SWEEP_INTERVAL_MS = 60_000;
let lastSweep = 0;

function sweep(now: number) {
  if (now - lastSweep < SWEEP_INTERVAL_MS) return;
  lastSweep = now;
  for (const [key, bucket] of BUCKETS) {
    if (bucket.resetAt < now) BUCKETS.delete(key);
  }
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: number;
}

/**
 * Returns whether the caller is under the limit. Increments the counter on
 * every call regardless of result, so callers should only invoke once per
 * logical request.
 *
 * @param key  Bucket identifier — usually `${endpoint}:${ip-or-email}`.
 * @param max  Max requests in the window.
 * @param windowMs  Window duration in milliseconds.
 */
export function rateLimit(
  key: string,
  max: number,
  windowMs: number,
): RateLimitResult {
  const now = Date.now();
  sweep(now);

  const existing = BUCKETS.get(key);
  if (!existing || existing.resetAt < now) {
    BUCKETS.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: max - 1, resetAt: now + windowMs };
  }
  existing.count += 1;
  return {
    allowed: existing.count <= max,
    remaining: Math.max(0, max - existing.count),
    resetAt: existing.resetAt,
  };
}

export function clientIpFromRequest(req: Request): string {
  const fwd = req.headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0].trim();
  const real = req.headers.get("x-real-ip");
  if (real) return real.trim();
  return "unknown";
}
