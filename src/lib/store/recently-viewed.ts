"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

// Tracks the last N product slugs a user has viewed. Strictly client-side
// — no server sync intended. Server-rendered "Son Görüntülenenler" strips
// can hydrate from this store inside a client island.

const MAX_ITEMS = 12;

interface RecentlyViewedState {
  slugs: string[];
  push: (slug: string) => void;
  clear: () => void;
}

export const useRecentlyViewedStore = create<RecentlyViewedState>()(
  persist(
    (set) => ({
      slugs: [],
      push: (slug) =>
        set((state) => {
          const filtered = state.slugs.filter((s) => s !== slug);
          return { slugs: [slug, ...filtered].slice(0, MAX_ITEMS) };
        }),
      clear: () => set({ slugs: [] }),
    }),
    {
      name: "simsek-recently-viewed-v1",
      storage: createJSONStorage(() => localStorage),
      version: 1,
    },
  ),
);
