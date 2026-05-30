import { describe, expect, it, vi } from "vitest";
import {
  restoreStock,
  deductStock,
  InsufficientStockError,
  type StockItem,
} from "@/lib/order-stock";

// Minimal fake transaction client. Records the Prisma calls the helpers make so
// we can assert the stock arithmetic without a live database.
function makeTx(updateManyCounts: number[] = []) {
  const counts = [...updateManyCounts];
  const update = vi.fn(async () => ({}));
  const updateMany = vi.fn(async () => ({ count: counts.shift() ?? 1 }));
  // The helpers only touch tx.product.*; the cast keeps TS happy.
  const tx = { product: { update, updateMany } } as never;
  return { tx, update, updateMany };
}

const items: StockItem[] = [
  { productId: "p1", quantity: 2 },
  { productId: "p2", quantity: 5 },
];

describe("restoreStock", () => {
  it("increments stock once per item", async () => {
    const { tx, update } = makeTx();
    await restoreStock(tx, items);
    expect(update).toHaveBeenCalledTimes(2);
    expect(update).toHaveBeenNthCalledWith(1, {
      where: { id: "p1" },
      data: { stock: { increment: 2 } },
    });
    expect(update).toHaveBeenNthCalledWith(2, {
      where: { id: "p2" },
      data: { stock: { increment: 5 } },
    });
  });

  it("no-ops on an empty item list", async () => {
    const { tx, update } = makeTx();
    await restoreStock(tx, []);
    expect(update).not.toHaveBeenCalled();
  });
});

describe("deductStock", () => {
  it("conditionally decrements with a stock>=qty guard", async () => {
    const { tx, updateMany } = makeTx([1, 1]);
    await deductStock(tx, items);
    expect(updateMany).toHaveBeenNthCalledWith(1, {
      where: { id: "p1", stock: { gte: 2 } },
      data: { stock: { decrement: 2 } },
    });
  });

  it("throws InsufficientStockError (with name) when a row can't be claimed", async () => {
    const { tx } = makeTx([0]);
    const names = new Map([["p1", "Koltuk"]]);
    await expect(deductStock(tx, items, names)).rejects.toBeInstanceOf(
      InsufficientStockError,
    );
    await expect(deductStock(makeTx([0]).tx, items, names)).rejects.toThrow(
      /Koltuk stokta yetersiz/,
    );
  });

  it("falls back to a generic name when none is supplied", async () => {
    const { tx } = makeTx([0]);
    await expect(deductStock(tx, items)).rejects.toThrow(/Ürün stokta yetersiz/);
  });
});
