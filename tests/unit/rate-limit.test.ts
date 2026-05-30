import { describe, expect, it } from "vitest";

// rate-limit.ts is server-only — vitest's happy-dom env runs node-ish, but the
// "server-only" import throws under client envs. Dynamic-importing inside each
// test avoids the bundler rewriting the server-only marker.
//
// The deterministic window logic lives in the sync `rateLimitInProcess`; the
// public `rateLimit` is async (KV-backed with in-process fallback) and is
// covered separately below.

describe("rate-limit", () => {
  it("allows up to N requests then blocks within the window", async () => {
    const { rateLimitInProcess } = await import("@/lib/rate-limit");
    const key = `test:${Math.random()}`;
    const first = rateLimitInProcess(key, 3, 60_000);
    const second = rateLimitInProcess(key, 3, 60_000);
    const third = rateLimitInProcess(key, 3, 60_000);
    const fourth = rateLimitInProcess(key, 3, 60_000);

    expect(first.allowed).toBe(true);
    expect(first.remaining).toBe(2);
    expect(second.allowed).toBe(true);
    expect(third.allowed).toBe(true);
    expect(third.remaining).toBe(0);
    expect(fourth.allowed).toBe(false);
  });

  it("isolates buckets by key", async () => {
    const { rateLimitInProcess } = await import("@/lib/rate-limit");
    const a = rateLimitInProcess(`a:${Math.random()}`, 1, 60_000);
    const b = rateLimitInProcess(`b:${Math.random()}`, 1, 60_000);
    expect(a.allowed).toBe(true);
    expect(b.allowed).toBe(true);
  });

  it("resets after the window elapses", async () => {
    const { rateLimitInProcess } = await import("@/lib/rate-limit");
    const key = `expiring:${Math.random()}`;
    // Burn the bucket.
    rateLimitInProcess(key, 1, 5);
    const blocked = rateLimitInProcess(key, 1, 5);
    expect(blocked.allowed).toBe(false);
    // Wait past the window.
    await new Promise((r) => setTimeout(r, 20));
    const fresh = rateLimitInProcess(key, 1, 5);
    expect(fresh.allowed).toBe(true);
  });

  it("async rateLimit falls back to in-process when no KV is configured", async () => {
    // No UPSTASH_REDIS_REST_URL/_TOKEN in the test env -> in-process backend.
    const { rateLimit } = await import("@/lib/rate-limit");
    const key = `async:${Math.random()}`;
    expect((await rateLimit(key, 2, 60_000)).allowed).toBe(true);
    expect((await rateLimit(key, 2, 60_000)).allowed).toBe(true);
    expect((await rateLimit(key, 2, 60_000)).allowed).toBe(false);
  });
});
