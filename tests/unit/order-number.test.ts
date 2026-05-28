import { describe, expect, it } from "vitest";
import {
  generateOrderNumber,
  isValidOrderNumberFormat,
} from "@/lib/order-number";

describe("order-number", () => {
  it("generates SM-XXXXXXXX format", () => {
    const n = generateOrderNumber();
    expect(n).toMatch(/^SM-[A-Z2-9]{8}$/);
  });

  it("never uses confusable chars 0/O/1/I/L", () => {
    for (let i = 0; i < 200; i++) {
      const n = generateOrderNumber();
      expect(n).not.toMatch(/[01OIL]/);
    }
  });

  it("validates known good format", () => {
    expect(isValidOrderNumberFormat("SM-ABCDEFGH")).toBe(true);
    expect(isValidOrderNumberFormat("SM-23456789")).toBe(true);
  });

  it("rejects bad formats", () => {
    expect(isValidOrderNumberFormat("sm-ABCDEFGH")).toBe(false); // lowercase
    expect(isValidOrderNumberFormat("SM-1BCDEFGH")).toBe(false); // contains 1
    expect(isValidOrderNumberFormat("SM-OBCDEFGH")).toBe(false); // contains O
    expect(isValidOrderNumberFormat("XX-ABCDEFGH")).toBe(false); // wrong prefix
    expect(isValidOrderNumberFormat("SM-ABCD")).toBe(false); // too short
  });

  it("generates non-enumerable ids (no two equal in a small sample)", () => {
    const set = new Set<string>();
    for (let i = 0; i < 500; i++) set.add(generateOrderNumber());
    // 32^8 = 1 trillion keyspace; 500 samples should not collide.
    expect(set.size).toBe(500);
  });
});
