import { describe, expect, it } from "vitest";
import {
  generateClientIdempotencyKey,
  hashIdempotencyKey,
  isValidIdempotencyKey,
  IDEMPOTENCY_HEADER,
} from "@/lib/idempotency";

describe("idempotency", () => {
  it("header name is the conventional one", () => {
    expect(IDEMPOTENCY_HEADER).toBe("idempotency-key");
  });

  it("hash is deterministic", () => {
    expect(hashIdempotencyKey("abc123")).toBe(hashIdempotencyKey("abc123"));
  });

  it("hash differs by input", () => {
    expect(hashIdempotencyKey("abc")).not.toBe(hashIdempotencyKey("abcd"));
  });

  it("accepts well-formed keys", () => {
    expect(isValidIdempotencyKey("12345678")).toBe(true);
    expect(
      isValidIdempotencyKey("01HZJX0-K0-CLAUDE-AI-TEST_OK"),
    ).toBe(true);
  });

  it("rejects too-short, too-long, or junk keys", () => {
    expect(isValidIdempotencyKey(null)).toBe(false);
    expect(isValidIdempotencyKey("short")).toBe(false);
    expect(isValidIdempotencyKey("with space")).toBe(false);
    expect(isValidIdempotencyKey("x".repeat(129))).toBe(false);
  });

  it("client-side generator returns a valid key", () => {
    const k = generateClientIdempotencyKey();
    expect(isValidIdempotencyKey(k)).toBe(true);
  });
});
