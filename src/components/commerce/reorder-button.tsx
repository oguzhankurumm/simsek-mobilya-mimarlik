"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { RotateCcw } from "lucide-react";
import { useCartStore } from "@/lib/store/cart";
import { useUIStore } from "@/lib/store/ui";

interface OrderItemForReorder {
  productId: string;
  quantity: number;
}

interface ReorderButtonProps {
  orderNumber: string;
  items: OrderItemForReorder[];
}

// Loads each of the past order's items into the cart, then opens the
// drawer. Out-of-stock items are silently skipped with a toast tally so
// the customer knows what didn't carry over. Server-fetches the current
// product snapshot per item (price + stock might have moved); we never
// inject stale order-line data into the cart.

export function ReorderButton({ orderNumber, items }: ReorderButtonProps) {
  const router = useRouter();
  const addItem = useCartStore((s) => s.addItem);
  const openCart = useUIStore((s) => s.openCart);
  const [busy, setBusy] = useState(false);

  async function handleClick() {
    setBusy(true);
    try {
      const skipped: string[] = [];
      let added = 0;
      for (const item of items) {
        const res = await fetch(`/api/products/${item.productId}`);
        if (!res.ok) {
          skipped.push("(silinmiş ürün)");
          continue;
        }
        const product = (await res.json()) as {
          id: string;
          name: string;
          slug: string;
          stock: number;
          brand: string;
          categorySlug: string;
          salePriceKurus: number;
          originalPriceKurus: number;
          image: string;
        };
        if (product.stock <= 0) {
          skipped.push(product.name);
          continue;
        }
        addItem(
          {
            id: product.id,
            name: product.name,
            slug: product.slug,
            originalPriceKurus: product.originalPriceKurus,
            salePriceKurus: product.salePriceKurus,
            image: product.image,
            brand: product.brand,
            stock: product.stock,
            categorySlug: product.categorySlug,
          },
          Math.min(item.quantity, product.stock),
        );
        added += 1;
      }
      if (added === 0) {
        toast.error(
          "Bu siparişteki hiçbir ürün şu an stokta değil. WhatsApp üzerinden iletişime geçebilirsiniz.",
        );
      } else if (skipped.length > 0) {
        toast.success(
          `${added} ürün sepete eklendi. ${skipped.length} ürün stokta olmadığı için atlandı.`,
        );
        setTimeout(() => openCart(), 200);
      } else {
        toast.success(`${added} ürün sepete eklendi`);
        setTimeout(() => openCart(), 200);
      }
      router.refresh();
    } finally {
      setBusy(false);
    }
    void orderNumber;
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={busy || items.length === 0}
      className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background px-4 py-2 text-xs font-medium hover:bg-surface-2 disabled:opacity-60"
    >
      <RotateCcw className="h-3.5 w-3.5" />
      {busy ? "Hazırlanıyor…" : "Yeniden Sipariş Ver"}
    </button>
  );
}
