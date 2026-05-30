import type { Prisma } from "@prisma/client";

// Stock movement helpers for order lifecycle transitions.
//
// Every non-CANCELLED order "holds" the stock that was decremented when it was
// created (see POST /api/orders). The symmetric rule is therefore:
//   - transition INTO  CANCELLED  -> restore (increment) the held stock
//   - transition OUT OF CANCELLED -> re-deduct (decrement) the stock
//
// The danger these helpers guard against is double-restore: customer cancel,
// the daily cron, and admin (single + bulk) cancel could each restore the same
// order's stock. Callers MUST first CLAIM the transition with a status-guarded
// `updateMany({ where: { id, status: <expected> } })` and only call
// `restoreStock` when that claim reports `count === 1`. The claim's row lock is
// what makes "restore exactly once" hold under concurrency.

type Tx = Prisma.TransactionClient;
export type StockItem = { productId: string; quantity: number };

export class InsufficientStockError extends Error {
  constructor(public readonly productName: string) {
    super(`${productName} stokta yetersiz`);
    this.name = "InsufficientStockError";
  }
}

/** Increment stock for each item. Call ONLY after claiming the transition. */
export async function restoreStock(tx: Tx, items: StockItem[]): Promise<void> {
  for (const item of items) {
    await tx.product.update({
      where: { id: item.productId },
      data: { stock: { increment: item.quantity } },
    });
  }
}

/**
 * Conditionally decrement stock for each item. Throws InsufficientStockError
 * (message contains "stokta", matching the order route's 409 detection) if any
 * product lacks the requested quantity — the surrounding transaction then rolls
 * back, so it is all-or-nothing.
 */
export async function deductStock(
  tx: Tx,
  items: StockItem[],
  nameById?: Map<string, string>,
): Promise<void> {
  for (const item of items) {
    const res = await tx.product.updateMany({
      where: { id: item.productId, stock: { gte: item.quantity } },
      data: { stock: { decrement: item.quantity } },
    });
    if (res.count === 0) {
      throw new InsufficientStockError(nameById?.get(item.productId) ?? "Ürün");
    }
  }
}
