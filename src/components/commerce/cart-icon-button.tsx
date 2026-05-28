"use client";

import { useEffect, useState } from "react";
import { ShoppingBag } from "lucide-react";
import { useUIStore } from "@/lib/store/ui";
import { selectTotalItems, useCartStore } from "@/lib/store/cart";
import { cn } from "@/lib/utils";

// Header cart icon. Mounted in site-header.tsx; opens the cart drawer on
// click. Badge reads from zustand cart store (localStorage-persisted).

export function CartIconButton({ className }: { className?: string }) {
  const openCart = useUIStore((s) => s.openCart);
  const totalItems = useCartStore(selectTotalItems);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  return (
    <button
      onClick={openCart}
      className={cn(
        "relative inline-flex h-9 w-9 items-center justify-center rounded-md text-ink-muted transition-colors hover:bg-surface-2 hover:text-brand",
        className,
      )}
      aria-label="Sepeti aç"
    >
      <ShoppingBag className="h-4 w-4" strokeWidth={1.75} />
      {mounted && totalItems > 0 ? (
        <span className="absolute -right-1 -top-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-brand px-1 text-[9px] font-bold leading-none text-white">
          {totalItems > 9 ? "9+" : totalItems}
        </span>
      ) : null}
    </button>
  );
}
