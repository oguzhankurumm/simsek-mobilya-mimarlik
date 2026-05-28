"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

// Wishlist is client-side for guests. When a user logs in, a hook syncs the
// localStorage list into the server-side Wishlist table (Phase D).

interface WishlistState {
  productIds: string[];
  toggle: (productId: string) => void;
  has: (productId: string) => boolean;
  clear: () => void;
}

export const useWishlistStore = create<WishlistState>()(
  persist(
    (set, get) => ({
      productIds: [],
      toggle: (productId) => {
        const set_ = new Set(get().productIds);
        if (set_.has(productId)) set_.delete(productId);
        else set_.add(productId);
        set({ productIds: Array.from(set_) });
      },
      has: (productId) => get().productIds.includes(productId),
      clear: () => set({ productIds: [] }),
    }),
    {
      name: "simsek-wishlist-v1",
      storage: createJSONStorage(() => localStorage),
      version: 1,
    },
  ),
);
