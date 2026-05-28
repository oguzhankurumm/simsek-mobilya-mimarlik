"use client";

import { useEffect, useState } from "react";
import { Heart } from "lucide-react";
import { toast } from "sonner";
import { useWishlistStore } from "@/lib/store/wishlist";
import { cn } from "@/lib/utils";

// Heart toggle. Optimistic: client state flips instantly, server call fires
// in the background. If the call fails AND the user is logged in, the
// client store stays in sync with what was just shown to them — server
// reconciles on next /api/user/wishlist GET. Guests get pure client-only
// behaviour (the next-login sync hook merges later).

interface WishlistButtonProps {
  productId: string;
  className?: string;
  variant?: "icon" | "labelled";
}

export function WishlistButton({
  productId,
  className,
  variant = "icon",
}: WishlistButtonProps) {
  const toggle = useWishlistStore((s) => s.toggle);
  const has = useWishlistStore((s) => s.has);
  const [mounted, setMounted] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  const isInList = mounted && has(productId);

  async function handleClick() {
    if (busy) return;
    setBusy(true);

    // Optimistic toggle.
    const willBeInList = !isInList;
    toggle(productId);

    try {
      const method = willBeInList ? "POST" : "DELETE";
      const url = willBeInList
        ? "/api/user/wishlist"
        : `/api/user/wishlist?productId=${encodeURIComponent(productId)}`;
      const res = await fetch(url, {
        method,
        ...(willBeInList
          ? {
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ productId }),
            }
          : {}),
      });
      // 401 == guest. That's fine — client store holds the list until login.
      if (res.status === 401) {
        // Don't roll back. Client store is the source of truth for guests.
      } else if (!res.ok) {
        // Real server error — roll back the optimistic flip.
        toggle(productId);
        toast.error("Favori kaydedilemedi");
      }
    } catch {
      toggle(productId);
      toast.error("Bağlantı hatası");
    } finally {
      setBusy(false);
    }
  }

  if (variant === "labelled") {
    return (
      <button
        onClick={handleClick}
        disabled={busy}
        className={cn(
          "inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-xs font-medium transition-colors",
          isInList
            ? "border-brand text-brand"
            : "text-ink-muted hover:bg-surface-2",
          className,
        )}
        aria-pressed={isInList}
      >
        <Heart
          className={cn("h-3.5 w-3.5", isInList && "fill-current")}
          strokeWidth={1.75}
        />
        {isInList ? "Favorilerimde" : "Favorilere ekle"}
      </button>
    );
  }

  return (
    <button
      onClick={handleClick}
      disabled={busy}
      className={cn(
        "inline-flex h-9 w-9 items-center justify-center rounded-full bg-background/90 backdrop-blur transition-colors",
        isInList ? "text-brand" : "text-ink-muted hover:text-brand",
        className,
      )}
      aria-pressed={isInList}
      aria-label={isInList ? "Favorilerden çıkar" : "Favorilere ekle"}
    >
      <Heart
        className={cn("h-4 w-4", isInList && "fill-current")}
        strokeWidth={1.75}
      />
    </button>
  );
}
