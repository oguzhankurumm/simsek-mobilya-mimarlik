"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Drawer } from "vaul";
import { Minus, Plus, ShoppingBag, Trash2, X } from "lucide-react";
import { useShallow } from "zustand/react/shallow";
import {
  selectCartItems,
  selectSavingsKurus,
  selectTotalItems,
  selectTotalKurus,
  useCartStore,
} from "@/lib/store/cart";
import { useUIStore } from "@/lib/store/ui";
import { formatPrice } from "@/lib/money";
import { cn } from "@/lib/utils";

// Right-side slide drawer for cart. Vaul gives us iOS-style snap + drag-to-
// dismiss + body scroll lock for free. We use it in modal mode anchored right.
// Marketing pages and commerce pages both mount this — cart access is global.

export function CartDrawer() {
  const { isCartOpen, closeCart } = useUIStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  const { items, totalItems, totalKurus, savingsKurus } = useCartStore(
    useShallow((s) => ({
      items: selectCartItems(s),
      totalItems: selectTotalItems(s),
      totalKurus: selectTotalKurus(s),
      savingsKurus: selectSavingsKurus(s),
    })),
  );

  const { removeItem, updateQuantity } = useCartStore();

  // Avoid SSR/CSR hydration mismatch — cart only exists in localStorage.
  const cartItems = mounted ? items : [];
  const displayTotal = mounted ? totalKurus : 0;
  const displaySavings = mounted ? savingsKurus : 0;
  const displayCount = mounted ? totalItems : 0;

  return (
    <Drawer.Root
      open={isCartOpen}
      onOpenChange={(open) => !open && closeCart()}
      direction="right"
    >
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 z-40 bg-black/50" />
        <Drawer.Content
          className={cn(
            "fixed right-0 top-0 z-50 flex h-full w-full max-w-sm flex-col bg-background outline-none",
            "shadow-2xl",
          )}
        >
          <Drawer.Title className="sr-only">Sepetim</Drawer.Title>

          <header className="flex items-center justify-between border-b border-border px-4 py-4">
            <div className="flex items-center gap-2">
              <ShoppingBag className="h-5 w-5" />
              <h2 className="text-sm font-semibold tracking-wide uppercase">
                Sepetim{" "}
                <span className="text-ink-muted">({displayCount} ürün)</span>
              </h2>
            </div>
            <button
              onClick={closeCart}
              className="rounded-md p-2 text-ink-muted hover:bg-surface-2"
              aria-label="Sepeti kapat"
            >
              <X className="h-4 w-4" />
            </button>
          </header>

          <div className="flex-1 overflow-y-auto">
            {cartItems.length === 0 ? (
              <div className="flex h-full flex-col items-center justify-center gap-4 px-6 py-12 text-center">
                <ShoppingBag className="h-12 w-12 text-ink-faint" />
                <p className="text-sm text-ink-muted">Sepetiniz boş</p>
                <Link
                  href="/urunler"
                  onClick={closeCart}
                  className="rounded-full bg-ink px-5 py-2.5 text-sm font-medium text-background hover:bg-ink/90"
                >
                  Ürünlere Göz At
                </Link>
              </div>
            ) : (
              <ul className="divide-y divide-border">
                {cartItems.map(({ product, quantity }) => (
                  <li key={product.id} className="flex gap-3 px-4 py-4">
                    <Link
                      href={`/urunler/${product.slug}`}
                      onClick={closeCart}
                      className="relative h-16 w-16 shrink-0 overflow-hidden rounded-md border border-border bg-surface-2"
                    >
                      <Image
                        src={
                          product.image ||
                          "/placeholder-product.svg"
                        }
                        alt={product.name}
                        fill
                        sizes="64px"
                        className="object-cover"
                      />
                    </Link>
                    <div className="flex flex-1 flex-col gap-1.5">
                      <Link
                        href={`/urunler/${product.slug}`}
                        onClick={closeCart}
                        className="line-clamp-2 text-sm font-medium leading-snug"
                      >
                        {product.name}
                      </Link>
                      {product.brand ? (
                        <p className="text-xs text-ink-faint">
                          {product.brand}
                        </p>
                      ) : null}
                      <p className="text-sm font-semibold">
                        {formatPrice(product.salePriceKurus)}
                      </p>
                      <div className="mt-1 inline-flex items-center gap-1.5">
                        <button
                          onClick={() =>
                            updateQuantity(product.id, quantity - 1)
                          }
                          className="flex h-7 w-7 items-center justify-center rounded border border-border text-ink-muted hover:border-brand hover:text-brand"
                          aria-label="Azalt"
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="w-6 text-center text-sm font-medium tabular-nums">
                          {quantity}
                        </span>
                        <button
                          onClick={() =>
                            updateQuantity(product.id, quantity + 1)
                          }
                          disabled={quantity >= product.stock}
                          className="flex h-7 w-7 items-center justify-center rounded border border-border text-ink-muted hover:border-brand hover:text-brand disabled:cursor-not-allowed disabled:opacity-40"
                          aria-label="Arttır"
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                    <button
                      onClick={() => removeItem(product.id)}
                      className="self-start p-1 text-ink-faint hover:text-brand"
                      aria-label="Sepetten çıkar"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {cartItems.length > 0 ? (
            <footer className="border-t border-border bg-surface-2/40 px-4 py-4">
              {displaySavings > 0 ? (
                <div className="mb-1.5 flex justify-between text-xs">
                  <span className="text-ink-muted">Toplam Tasarruf</span>
                  <span className="font-semibold text-emerald-700 dark:text-emerald-400">
                    {formatPrice(displaySavings)}
                  </span>
                </div>
              ) : null}
              <div className="mb-3 flex items-baseline justify-between">
                <span className="text-sm uppercase tracking-wide text-ink-muted">
                  Toplam
                </span>
                <span className="text-lg font-semibold tabular-nums">
                  {formatPrice(displayTotal)}
                </span>
              </div>
              <p className="mb-3 text-xs text-ink-muted">
                KDV dahil. Kargo sepetten sonra hesaplanır.
              </p>
              <Link
                href="/odeme"
                onClick={closeCart}
                className="flex items-center justify-center rounded-full bg-brand px-6 py-3 text-sm font-semibold text-white hover:bg-brand/90"
              >
                Ödemeye Geç →
              </Link>
            </footer>
          ) : null}
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}
