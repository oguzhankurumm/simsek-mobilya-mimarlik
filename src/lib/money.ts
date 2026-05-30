import type { Prisma } from "@prisma/client";

// JS float math on TL prices loses precision (3 * 4166.67 = 12500.01 not 12500.00).
// Everywhere in app code, money is INTEGER kuruş. DB stores Decimal TL,
// converted at the boundary.

export const KURUS_PER_TL = 100;

export function tlToKurus(tl: number | string | Prisma.Decimal): number {
  const n = typeof tl === "number" ? tl : Number(tl);
  if (!Number.isFinite(n)) {
    // A corrupted price must not silently become a free (0,00 ₺) item in an
    // email or on a product page. Surface it; the 0 keeps callers from throwing.
    console.error("[money] tlToKurus received a non-finite value:", tl);
    return 0;
  }
  // Math.round to dodge sub-cent float drift on conversion.
  return Math.round(n * KURUS_PER_TL);
}

export function kurusToTl(kurus: number): number {
  return kurus / KURUS_PER_TL;
}

const TRY_FORMATTER = new Intl.NumberFormat("tr-TR", {
  style: "currency",
  currency: "TRY",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export function formatPrice(kurus: number): string {
  return TRY_FORMATTER.format(kurusToTl(kurus));
}

const NUMBER_FORMATTER = new Intl.NumberFormat("tr-TR", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export function formatPriceNoCurrency(kurus: number): string {
  return NUMBER_FORMATTER.format(kurusToTl(kurus));
}

export type CartLineSnapshot = {
  salePriceKurus: number;
  originalPriceKurus: number;
  quantity: number;
};

export function lineTotal(line: CartLineSnapshot): number {
  return line.salePriceKurus * line.quantity;
}

export function cartTotals(lines: CartLineSnapshot[]) {
  let subtotal = 0;
  let savings = 0;
  for (const line of lines) {
    subtotal += line.salePriceKurus * line.quantity;
    savings +=
      (line.originalPriceKurus - line.salePriceKurus) * line.quantity;
  }
  return { subtotal, savings, total: subtotal };
}
