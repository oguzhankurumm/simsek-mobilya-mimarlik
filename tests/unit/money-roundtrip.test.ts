import { describe, expect, it } from "vitest";
import { tlToKurus, kurusToTl, formatPrice, cartTotals } from "@/lib/money";

describe("money — roundtrip + edge cases", () => {
  it("kuruş roundtrip preserves common shop prices", () => {
    const cases = [99.99, 1, 1499.5, 27500, 4166.67, 99999.99];
    for (const tl of cases) {
      const k = tlToKurus(tl);
      const back = kurusToTl(k);
      // Rounding tolerated: we always commit at integer kuruş.
      expect(Math.abs(back - tl)).toBeLessThanOrEqual(0.01);
    }
  });

  it("handles Decimal-style string inputs from Prisma", () => {
    expect(tlToKurus("125.50")).toBe(12550);
    expect(tlToKurus("0.00")).toBe(0);
    expect(tlToKurus("12500")).toBe(1250000);
  });

  it("cartTotals stays consistent when prices repeat", () => {
    // Repro for the daf-yapi 3 × 4166.67 invariant.
    const unit = tlToKurus(4166.67);
    const out = cartTotals([
      { salePriceKurus: unit, originalPriceKurus: unit, quantity: 3 },
    ]);
    expect(out.total).toBe(unit * 3);
    // Display is still nice even at extremes.
    expect(formatPrice(out.total)).toContain("12.500,01");
  });

  it("savings sums up across heterogeneous lines", () => {
    const out = cartTotals([
      { salePriceKurus: 8000, originalPriceKurus: 10000, quantity: 1 },
      { salePriceKurus: 3000, originalPriceKurus: 3000, quantity: 2 },
      { salePriceKurus: 1500, originalPriceKurus: 2000, quantity: 4 },
    ]);
    expect(out.savings).toBe((10000 - 8000) * 1 + (2000 - 1500) * 4);
    expect(out.subtotal).toBe(8000 + 6000 + 6000);
  });

  it("formatPrice handles very small + very large numbers", () => {
    const tiny = formatPrice(1); // 1 kuruş = 0,01 TL
    // 100,000,000,000 kuruş = 1,000,000,000 TL (1 milyar)
    const huge = formatPrice(100_000_000_000);
    expect(tiny).toContain("0,01");
    expect(huge).toMatch(/1\.000\.000\.000,00/);
  });
});
