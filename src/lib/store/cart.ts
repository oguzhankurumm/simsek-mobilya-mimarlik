"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

// Cart lives entirely on the client (zustand persisted to localStorage).
// Server only sees the cart when POST /api/orders fires; that endpoint
// recomputes totals from the DB so a tampered client payload can't change
// the price (see src/lib/money.ts and src/app/api/orders/route.ts later).

export interface CartProduct {
  id: string;
  name: string;
  slug: string;
  // Prices in INTEGER kuruş — see src/lib/money.ts.
  originalPriceKurus: number;
  salePriceKurus: number;
  image: string;
  brand: string;
  stock: number;
  categorySlug: string;
}

export interface CartItem {
  product: CartProduct;
  quantity: number;
}

interface CartState {
  items: CartItem[];
  addItem: (product: CartProduct, quantity?: number) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
}

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      items: [],

      addItem: (product, quantity = 1) => {
        set((state) => {
          const existing = state.items.find(
            (item) => item.product.id === product.id,
          );
          if (existing) {
            return {
              items: state.items.map((item) =>
                item.product.id === product.id
                  ? {
                      ...item,
                      quantity: Math.min(
                        item.quantity + quantity,
                        item.product.stock,
                      ),
                    }
                  : item,
              ),
            };
          }
          return {
            items: [
              ...state.items,
              {
                product,
                quantity: Math.min(quantity, product.stock),
              },
            ],
          };
        });
      },

      removeItem: (productId) => {
        set((state) => ({
          items: state.items.filter(
            (item) => item.product.id !== productId,
          ),
        }));
      },

      updateQuantity: (productId, quantity) => {
        set((state) => ({
          items:
            quantity <= 0
              ? state.items.filter((item) => item.product.id !== productId)
              : state.items.map((item) =>
                  item.product.id === productId
                    ? {
                        ...item,
                        quantity: Math.min(quantity, item.product.stock),
                      }
                    : item,
                ),
        }));
      },

      clearCart: () => set({ items: [] }),
    }),
    {
      name: "simsek-cart-v1",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ items: state.items }),
      version: 1,
    },
  ),
);

// Selectors — use with useShallow when picking multiple to avoid re-renders.
export const selectCartItems = (s: CartState) => s.items;
export const selectTotalItems = (s: CartState) =>
  s.items.reduce((sum, i) => sum + i.quantity, 0);
export const selectTotalKurus = (s: CartState) =>
  s.items.reduce(
    (sum, i) => sum + i.product.salePriceKurus * i.quantity,
    0,
  );
export const selectSavingsKurus = (s: CartState) =>
  s.items.reduce(
    (sum, i) =>
      sum +
      (i.product.originalPriceKurus - i.product.salePriceKurus) *
        i.quantity,
    0,
  );
