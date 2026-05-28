import { describe, expect, it } from "vitest";
import {
  cartTotals,
  formatPrice,
  kurusToTl,
  tlToKurus,
} from "@/lib/money";

describe("money", () => {
  describe("tlToKurus", () => {
    it("converts TL to integer kuruş", () => {
      expect(tlToKurus(125.5)).toBe(12550);
      expect(tlToKurus("125.50")).toBe(12550);
      expect(tlToKurus(0)).toBe(0);
    });

    it("avoids floating-point drift on sub-cent values", () => {
      // 4166.67 × 100 in raw JS = 416666.99999999994 — Math.round saves us.
      expect(tlToKurus(4166.67)).toBe(416667);
    });

    it("returns 0 for non-finite input", () => {
      expect(tlToKurus(NaN)).toBe(0);
      expect(tlToKurus(Infinity)).toBe(0);
    });
  });

  describe("kurusToTl", () => {
    it("converts integer kuruş back to TL", () => {
      expect(kurusToTl(12550)).toBe(125.5);
      expect(kurusToTl(0)).toBe(0);
    });
  });

  describe("formatPrice", () => {
    it("formats kuruş as TR locale currency", () => {
      const s = formatPrice(1_250_000);
      // ICU TR locale uses ₺ prefix on currency. Whitespace between ₺ and
      // digits varies by ICU version (regular vs non-breaking space), so we
      // sanity-check the digits + currency mark are present in either order.
      expect(s).toContain("12.500,00");
      expect(s).toContain("₺");
    });

    it("formats zero gracefully", () => {
      const s = formatPrice(0);
      expect(s).toContain("0,00");
      expect(s).toContain("₺");
    });
  });

  describe("cartTotals", () => {
    it("sums subtotal across lines", () => {
      const lines = [
        { salePriceKurus: 1000, originalPriceKurus: 1200, quantity: 2 },
        { salePriceKurus: 500, originalPriceKurus: 500, quantity: 1 },
      ];
      const out = cartTotals(lines);
      expect(out.subtotal).toBe(1000 * 2 + 500);
      expect(out.savings).toBe((1200 - 1000) * 2);
      expect(out.total).toBe(out.subtotal);
    });

    it("server total matches client total when prices align (no drift)", () => {
      // 3 × 4166.67 = 12500.01 in float, 12500 in integer kuruş (after
      // converting once at the boundary). Exercise the invariant directly.
      const unitKurus = tlToKurus(4166.67);
      const total = cartTotals([
        { salePriceKurus: unitKurus, originalPriceKurus: unitKurus, quantity: 3 },
      ]).total;
      expect(total).toBe(unitKurus * 3);
    });
  });
});
