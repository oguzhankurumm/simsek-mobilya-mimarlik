import "server-only";

// Rate limiter with two backends:
//   - Upstash Redis (REST) when UPSTASH_REDIS_REST_URL + _TOKEN are set —
//     cross-instance, correct on Vercel fluid compute / multi-region.
//   - In-process Map fallback otherwise (and whenever KV is unreachable) —
//     per-instance, fine for low-traffic "no one should hit this 30x/hour"
//     thresholds and for local dev where no KV is provisioned.
//
// Public API is async. Call once per logical request: every call increments.

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: number;
}

// ───────────────────────── in-process backend ─────────────────────────

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

// Exported for tests and used as the fallback backend.
export function rateLimitInProcess(
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

// ───────────────────────── Upstash KV backend ─────────────────────────

// Atomic fixed-window via INCR + EXPIRE NX (TTL set only on the first hit, so
// the window doesn't keep sliding forward). Returns null when KV is not
// configured OR unreachable, so the caller transparently falls back to the
// in-process limiter rather than failing the request.
async function rateLimitKv(
  key: string,
  max: number,
  windowMs: number,
): Promise<RateLimitResult | null> {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;

  const windowSec = Math.max(1, Math.ceil(windowMs / 1000));
  const ns = `rl:${key}`;
  try {
    const res = await fetch(`${url}/pipeline`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify([
        ["INCR", ns],
        ["EXPIRE", ns, windowSec, "NX"],
      ]),
      // A slow/unreachable KV must not hang the request — fall back instead.
      signal: AbortSignal.timeout(800),
      cache: "no-store",
    });
    if (!res.ok) return null;
    const data = (await res.json()) as Array<{ result?: number }>;
    const count = Number(data?.[0]?.result ?? 0);
    if (!count) return null;
    return {
      allowed: count <= max,
      remaining: Math.max(0, max - count),
      resetAt: Date.now() + windowMs,
    };
  } catch {
    return null; // network error / timeout / bad JSON → fall back
  }
}

// ───────────────────────────── public API ─────────────────────────────

/**
 * Returns whether the caller is under the limit. Increments the counter on
 * every call, so invoke once per logical request.
 *
 * Uses Upstash Redis when configured (cross-instance), else an in-process Map
 * (per-instance). KV errors degrade gracefully to the in-process backend.
 *
 * @param key  Bucket identifier — usually `${endpoint}:${ip-or-email}`.
 * @param max  Max requests in the window.
 * @param windowMs  Window duration in milliseconds.
 */
export async function rateLimit(
  key: string,
  max: number,
  windowMs: number,
): Promise<RateLimitResult> {
  const kv = await rateLimitKv(key, max, windowMs);
  return kv ?? rateLimitInProcess(key, max, windowMs);
}

export function clientIpFromRequest(req: Request): string {
  const fwd = req.headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0].trim();
  const real = req.headers.get("x-real-ip");
  if (real) return real.trim();
  return "unknown";
}
