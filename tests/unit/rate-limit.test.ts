import { describe, expect, it } from "vitest";

// rate-limit.ts is server-only — vitest happy-dom env runs in node-ish, but
// the "server-only" import throws under client envs. Since we only call
// pure functions here it's fine: dynamic-importing avoids the bundler
// rewriting the server-only marker.

describe("rate-limit", () => {
  it("allows up to N requests then blocks within the window", async () => {
    const { rateLimit } = await import("@/lib/rate-limit");
    const key = `test:${Math.random()}`;
    const first = rateLimit(key, 3, 60_000);
    const second = rateLimit(key, 3, 60_000);
    const third = rateLimit(key, 3, 60_000);
    const fourth = rateLimit(key, 3, 60_000);

    expect(first.allowed).toBe(true);
    expect(first.remaining).toBe(2);
    expect(second.allowed).toBe(true);
    expect(third.allowed).toBe(true);
    expect(third.remaining).toBe(0);
    expect(fourth.allowed).toBe(false);
  });

  it("isolates buckets by key", async () => {
    const { rateLimit } = await import("@/lib/rate-limit");
    const a = rateLimit(`a:${Math.random()}`, 1, 60_000);
    const b = rateLimit(`b:${Math.random()}`, 1, 60_000);
    expect(a.allowed).toBe(true);
    expect(b.allowed).toBe(true);
  });

  it("resets after the window elapses", async () => {
    const { rateLimit } = await import("@/lib/rate-limit");
    const key = `expiring:${Math.random()}`;
    // Burn the bucket.
    rateLimit(key, 1, 5);
    const blocked = rateLimit(key, 1, 5);
    expect(blocked.allowed).toBe(false);
    // Wait past the window.
    await new Promise((r) => setTimeout(r, 20));
    const fresh = rateLimit(key, 1, 5);
    expect(fresh.allowed).toBe(true);
  });
});
