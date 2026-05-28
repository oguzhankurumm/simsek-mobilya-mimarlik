"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import { useShallow } from "zustand/react/shallow";
import {
  selectCartItems,
  selectSavingsKurus,
  selectTotalKurus,
  useCartStore,
} from "@/lib/store/cart";
import { formatPrice } from "@/lib/money";

export function CartPageClient() {
  const { items, totalKurus, savingsKurus } = useCartStore(
    useShallow((s) => ({
      items: selectCartItems(s),
      totalKurus: selectTotalKurus(s),
      savingsKurus: selectSavingsKurus(s),
    })),
  );
  const { removeItem, updateQuantity } = useCartStore();
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  const cartItems = mounted ? items : [];
  const displayTotal = mounted ? totalKurus : 0;
  const displaySavings = mounted ? savingsKurus : 0;
  const subtotal = displayTotal + displaySavings;

  if (cartItems.length === 0) {
    return (
      <section className="container mx-auto max-w-2xl px-4 py-16 text-center">
        <ShoppingBag className="mx-auto h-12 w-12 text-ink-faint" />
        <h1 className="mt-4 text-display text-3xl tracking-tight">
          Sepetim
        </h1>
        <p className="mt-2 text-sm text-ink-muted">Sepetiniz boş.</p>
        <Link
          href="/urunler"
          className="mt-6 inline-block rounded-full bg-brand px-6 py-3 text-sm font-semibold text-white hover:bg-brand/90"
        >
          Ürünlere Göz At
        </Link>
      </section>
    );
  }

  return (
    <section className="container mx-auto max-w-3xl px-4 py-10">
      <header className="mb-6">
        <p className="text-[10px] font-mono uppercase tracking-widest text-ink-faint">
          Alışveriş
        </p>
        <h1 className="mt-1 text-display text-3xl tracking-tight">
          Sepetim
          <span className="ml-3 text-base font-normal text-ink-muted">
            ({cartItems.reduce((s, i) => s + i.quantity, 0)} ürün)
          </span>
        </h1>
      </header>

      <ul className="divide-y divide-border rounded-2xl border border-border bg-background">
        {cartItems.map(({ product, quantity }) => (
          <li key={product.id} className="flex gap-4 p-4 md:p-5">
            <Link
              href={`/urunler/${product.slug}`}
              className="relative h-20 w-20 shrink-0 overflow-hidden rounded-md border border-border bg-surface-2 md:h-24 md:w-24"
            >
              <Image
                src={product.image || "/placeholder-product.svg"}
                alt={product.name}
                fill
                sizes="(min-width: 768px) 96px, 80px"
                className="object-cover"
              />
            </Link>
            <div className="flex flex-1 flex-col justify-between gap-2">
              <div>
                <Link
                  href={`/urunler/${product.slug}`}
                  className="text-sm font-medium leading-snug md:text-base"
                >
                  {product.name}
                </Link>
                <p className="mt-0.5 text-xs text-ink-muted">
                  {product.brand}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => updateQuantity(product.id, quantity - 1)}
                  className="flex h-8 w-8 items-center justify-center rounded border border-border hover:border-brand hover:text-brand"
                  aria-label="Azalt"
                >
                  <Minus className="h-3.5 w-3.5" />
                </button>
                <span className="w-6 text-center text-sm font-semibold tabular-nums">
                  {quantity}
                </span>
                <button
                  onClick={() => updateQuantity(product.id, quantity + 1)}
                  disabled={quantity >= product.stock}
                  className="flex h-8 w-8 items-center justify-center rounded border border-border hover:border-brand hover:text-brand disabled:cursor-not-allowed disabled:opacity-40"
                  aria-label="Arttır"
                >
                  <Plus className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
            <div className="flex flex-col items-end justify-between gap-2">
              <button
                onClick={() => removeItem(product.id)}
                className="text-ink-faint hover:text-brand"
                aria-label="Sepetten çıkar"
              >
                <Trash2 className="h-4 w-4" />
              </button>
              <p className="text-sm font-semibold tabular-nums md:text-base">
                {formatPrice(product.salePriceKurus * quantity)}
              </p>
            </div>
          </li>
        ))}
      </ul>

      <div className="mt-6 rounded-2xl border border-border bg-surface-2/40 p-5">
        <div className="flex justify-between text-sm text-ink-muted">
          <span>Ara Toplam</span>
          <span className="tabular-nums">{formatPrice(subtotal)}</span>
        </div>
        {displaySavings > 0 ? (
          <div className="mt-1 flex justify-between text-sm">
            <span className="font-medium text-emerald-700 dark:text-emerald-400">
              Toplam Tasarruf
            </span>
            <span className="font-semibold text-emerald-700 dark:text-emerald-400 tabular-nums">
              − {formatPrice(displaySavings)}
            </span>
          </div>
        ) : null}
        <hr className="my-3 border-border" />
        <div className="flex items-baseline justify-between">
          <span className="text-base font-semibold">Ödenecek Toplam</span>
          <span className="text-2xl font-bold tabular-nums">
            {formatPrice(displayTotal)}
          </span>
        </div>
        <p className="mt-1 text-[10px] text-ink-faint">KDV dahildir.</p>
        <Link
          href="/odeme"
          className="mt-5 flex w-full items-center justify-center rounded-full bg-brand py-3.5 text-sm font-semibold text-white hover:bg-brand/90"
        >
          Ödemeye Geç →
        </Link>
      </div>
    </section>
  );
}
