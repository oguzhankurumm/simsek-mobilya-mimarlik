"use client";

import { useEffect, useRef, useState } from "react";
import { useCartStore, type CartProduct } from "@/lib/store/cart";
import { useUIStore } from "@/lib/store/ui";
import { formatPrice } from "@/lib/money";
import { toast } from "sonner";
import { ShoppingBag } from "lucide-react";
import { cn } from "@/lib/utils";

interface PdpStickyCtaProps {
  product: CartProduct;
  /** Render-only — the source-of-truth inline button stays at top of PDP. */
}

// Mobile-only sticky bottom CTA. Appears when the user scrolls past the
// inline "Sepete Ekle" button on PDP (specifically, when the inline button
// leaves the top of the viewport). Stacks above the bottom-tab nav using
// safe-area-inset-bottom + an offset for the tab bar.

export function PdpStickyCta({ product }: PdpStickyCtaProps) {
  const addItem = useCartStore((s) => s.addItem);
  const openCart = useUIStore((s) => s.openCart);
  const [visible, setVisible] = useState(false);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    // Look for the inline AddToCart button on the page; the sticky CTA
    // becomes visible only once that button has scrolled out of view.
    const target = document.querySelector(
      "[data-pdp-add-to-cart-anchor]",
    ) as HTMLElement | null;
    if (!target) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setVisible(!entry.isIntersecting);
      },
      { rootMargin: "-72px 0px 0px 0px", threshold: 0 },
    );
    observer.observe(target);
    return () => observer.disconnect();
  }, []);

  const isOutOfStock = product.stock <= 0;

  function handleAdd() {
    if (isOutOfStock) return;
    addItem(product, 1);
    if (
      typeof navigator !== "undefined" &&
      "vibrate" in navigator &&
      typeof navigator.vibrate === "function"
    ) {
      navigator.vibrate(8);
    }
    toast.success("Sepete eklendi", {
      description: product.name,
      duration: 1500,
    });
    setTimeout(() => openCart(), 200);
  }

  if (isOutOfStock) return <div ref={sentinelRef} aria-hidden />;

  return (
    <div
      aria-hidden={!visible}
      className={cn(
        "fixed left-0 right-0 z-30 border-t border-border bg-background/95 backdrop-blur-xl backdrop-saturate-150 px-4 py-3 shadow-[0_-4px_24px_-12px_rgba(0,0,0,0.15)] transition-transform duration-200 md:hidden",
        // Sit directly above the bottom-tab nav (h-16 ≈ 64px + safe area).
        "bottom-16 pb-[env(safe-area-inset-bottom)]",
        visible ? "translate-y-0" : "translate-y-[200%]",
      )}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="truncate text-xs text-ink-muted">{product.name}</p>
          <p className="text-base font-semibold tabular-nums">
            {formatPrice(product.salePriceKurus)}
          </p>
        </div>
        <button
          onClick={handleAdd}
          className="inline-flex h-11 shrink-0 items-center gap-1.5 rounded-full bg-brand px-5 text-sm font-semibold text-white transition-transform active:scale-95"
        >
          <ShoppingBag className="h-4 w-4" />
          Sepete Ekle
        </button>
      </div>
    </div>
  );
}
