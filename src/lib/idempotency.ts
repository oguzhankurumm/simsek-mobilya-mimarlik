import { sha256 } from "./auth";

// POST /api/orders accepts an `Idempotency-Key` header. Client generates a
// UUID before the request, so a retry after a network glitch returns the
// original order instead of creating a duplicate.

export const IDEMPOTENCY_HEADER = "idempotency-key";

export function hashIdempotencyKey(rawKey: string): string {
  return sha256(rawKey);
}

export function isValidIdempotencyKey(key: string | null): boolean {
  if (!key) return false;
  if (key.length < 8 || key.length > 128) return false;
  return /^[a-zA-Z0-9_-]+$/.test(key);
}

export function generateClientIdempotencyKey(): string {
  // Browser-only. Server should not generate keys.
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  // Fallback for older browsers (rare in 2026 but cheap to keep).
  return `${Date.now()}-${Math.random().toString(36).slice(2, 12)}`;
}
