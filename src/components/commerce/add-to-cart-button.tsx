"use client";

import { useState } from "react";
import { toast } from "sonner";
import { ShoppingBag, Check } from "lucide-react";
import {
  useCartStore,
  type CartProduct,
} from "@/lib/store/cart";
import { useUIStore } from "@/lib/store/ui";
import { cn } from "@/lib/utils";

interface AddToCartButtonProps {
  product: CartProduct;
  className?: string;
  // When true (PDP), opens the cart drawer after a successful add. When false
  // (listing card hover etc.), just shows a toast — keeps the user browsing.
  openDrawerOnAdd?: boolean;
}

export function AddToCartButton({
  product,
  className,
  openDrawerOnAdd = true,
}: AddToCartButtonProps) {
  const addItem = useCartStore((s) => s.addItem);
  const openCart = useUIStore((s) => s.openCart);
  const [justAdded, setJustAdded] = useState(false);

  const isOutOfStock = product.stock <= 0;

  function handleAdd() {
    if (isOutOfStock) return;
    addItem(product, 1);
    setJustAdded(true);
    toast.success("Sepete eklendi", {
      description: product.name,
      duration: 2000,
    });

    // Light haptic on supported browsers — feels native, fails silently
    // elsewhere.
    if (
      typeof navigator !== "undefined" &&
      "vibrate" in navigator &&
      typeof navigator.vibrate === "function"
    ) {
      navigator.vibrate(8);
    }

    if (openDrawerOnAdd) {
      // Small delay so the toast pops first, then the drawer slides in.
      setTimeout(() => openCart(), 200);
    }
    setTimeout(() => setJustAdded(false), 1500);
  }

  if (isOutOfStock) {
    return (
      <button
        disabled
        className={cn(
          "inline-flex h-12 items-center justify-center gap-2 rounded-full bg-surface-2 px-6 text-sm font-medium text-ink-muted",
          className,
        )}
      >
        Stokta Yok
      </button>
    );
  }

  return (
    <button
      onClick={handleAdd}
      data-pdp-add-to-cart-anchor
      className={cn(
        "inline-flex h-12 items-center justify-center gap-2 rounded-full bg-brand px-6 text-sm font-semibold text-white transition-all hover:bg-brand/90 active:scale-95",
        justAdded && "bg-emerald-600 hover:bg-emerald-600",
        className,
      )}
    >
      {justAdded ? (
        <>
          <Check className="h-4 w-4" /> Eklendi
        </>
      ) : (
        <>
          <ShoppingBag className="h-4 w-4" /> Sepete Ekle
        </>
      )}
    </button>
  );
}
