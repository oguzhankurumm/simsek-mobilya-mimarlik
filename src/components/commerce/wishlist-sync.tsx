"use client";

import { useEffect } from "react";
import { useWishlistStore } from "@/lib/store/wishlist";

// On every authenticated route render (mounted under /hesabim), we push the
// local wishlist up to the server and pull the merged authoritative list
// back. Runs once per session (sessionStorage flag) so we don't spam the
// endpoint on every navigation.

const SYNC_FLAG = "simsek-wishlist-synced";

export function WishlistSync() {
  const productIds = useWishlistStore((s) => s.productIds);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (sessionStorage.getItem(SYNC_FLAG)) return;

    let cancelled = false;
    fetch("/api/user/wishlist/sync", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productIds }),
    })
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (cancelled || !data) return;
        // Replace the local list with the server-merged set.
        useWishlistStore.setState({ productIds: data.productIds });
        sessionStorage.setItem(SYNC_FLAG, "1");
      })
      .catch(() => undefined);

    return () => {
      cancelled = true;
    };
    // We only want this to run once per mount. productIds in the deps would
    // re-sync on every toggle.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
}
