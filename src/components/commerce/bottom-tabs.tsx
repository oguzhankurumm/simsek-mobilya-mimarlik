"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { COMMERCE_BOTTOM_TABS } from "@/config/commerce-nav";
import { selectTotalItems, useCartStore } from "@/lib/store/cart";
import { useUIStore } from "@/lib/store/ui";
import { cn } from "@/lib/utils";

// Sticky mobile-only bottom navigation. Visible on every page so users can
// jump between marketing pages and commerce pages without losing context.
// Hidden on /admin/* (admin layout doesn't mount this).
// safe-area-inset-bottom respects iPhone home indicator.

export function BottomTabs() {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  // Cart badge needs SSR/CSR safety — count comes from localStorage.
  const totalItems = useCartStore(selectTotalItems);
  const openCart = useUIStore((s) => s.openCart);
  const openMobileMenu = useUIStore((s) => s.openMobileMenu);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  // Hide on admin pages — admin layout doesn't mount this, but defensive check
  // in case it's rendered from root layout.
  if (pathname.startsWith("/admin")) return null;

  return (
    <nav
      aria-label="Mobil navigasyon"
      className={cn(
        "fixed bottom-0 left-0 right-0 z-30",
        "border-t border-border bg-background/95 backdrop-blur-xl backdrop-saturate-150",
        "pb-[env(safe-area-inset-bottom)]",
        "md:hidden",
      )}
    >
      <ul className="grid grid-cols-5 px-1">
        {COMMERCE_BOTTOM_TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive =
            tab.href === "/"
              ? pathname === "/"
              : pathname === tab.href || pathname.startsWith(`${tab.href}/`);

          if (tab.opensDrawer === "menu") {
            return (
              <li key={tab.href}>
                <button
                  onClick={openMobileMenu}
                  className="flex w-full flex-col items-center gap-0.5 px-2 py-2 text-ink-muted active:scale-95 transition-transform"
                  aria-label="Menüyü aç"
                >
                  <Icon className="h-5 w-5" strokeWidth={1.75} />
                  <span className="text-[10px] font-medium leading-none">
                    {tab.labelTr}
                  </span>
                </button>
              </li>
            );
          }

          const isCart = tab.isCart === true;
          return (
            <li key={tab.href} className="relative">
              <Link
                href={tab.href}
                onClick={(e) => {
                  if (isCart) {
                    e.preventDefault();
                    openCart();
                  }
                }}
                className={cn(
                  "flex flex-col items-center gap-0.5 px-2 py-2 transition-transform active:scale-95",
                  isActive ? "text-brand" : "text-ink-muted",
                )}
                aria-current={isActive ? "page" : undefined}
              >
                <span className="relative">
                  <Icon className="h-5 w-5" strokeWidth={1.75} />
                  {isCart && mounted && totalItems > 0 ? (
                    <span className="absolute -right-2 -top-1.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-brand px-1 text-[9px] font-bold leading-none text-white">
                      {totalItems > 9 ? "9+" : totalItems}
                    </span>
                  ) : null}
                </span>
                <span className="text-[10px] font-medium leading-none">
                  {tab.labelTr}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
