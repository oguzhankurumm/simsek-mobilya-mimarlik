import { describe, expect, it } from "vitest";
import {
  generateOrderNumber,
  isValidOrderNumberFormat,
} from "@/lib/order-number";

describe("order-number — entropy + format invariants", () => {
  it("produces distinct values across 5000 calls", () => {
    const set = new Set<string>();
    for (let i = 0; i < 5000; i++) set.add(generateOrderNumber());
    // 31^8 keyspace ~= 852 billion. 5000 samples should never collide.
    expect(set.size).toBe(5000);
  });

  it("rejects whitespace and weird punctuation", () => {
    expect(isValidOrderNumberFormat("SM- ABCDEFG")).toBe(false);
    expect(isValidOrderNumberFormat("SM-ABCDEFG\n")).toBe(false);
    expect(isValidOrderNumberFormat("SM--ABCDEFGH")).toBe(false);
    expect(isValidOrderNumberFormat("")).toBe(false);
    expect(isValidOrderNumberFormat("   ")).toBe(false);
  });

  it("alphabet stays uppercase + digits in the safe set", () => {
    for (let i = 0; i < 100; i++) {
      const n = generateOrderNumber();
      // After "SM-" each char is uppercase ASCII letter (no L) or digit 2-9.
      const body = n.slice(3);
      for (const ch of body) {
        const code = ch.charCodeAt(0);
        const isLetter = code >= 65 && code <= 90 && ch !== "L" && ch !== "I" && ch !== "O";
        const isDigit = code >= 50 && code <= 57; // 2..9
        expect(isLetter || isDigit).toBe(true);
      }
    }
  });
});
