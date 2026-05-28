/**
 * Commerce-specific navigation primitives.
 * KEPT SEPARATE from src/config/site.ts NAV_ITEMS — bottom-tab labels at
 * 360px width can't fit 14-char Turkish words like "Çalışmalarımız", so each
 * surface gets its own short label set. (Phase 2 review T08.)
 */
import type { LucideIcon } from "lucide-react";
import {
  Home,
  ShoppingBag,
  ShoppingCart,
  User,
  Menu,
} from "lucide-react";

export type CommerceTab = {
  href: string;
  labelTr: string;
  icon: LucideIcon;
  // If true, the cart badge renders on this tab.
  isCart?: boolean;
  // If true, opens the menu drawer instead of navigating.
  opensDrawer?: "menu";
};

export const COMMERCE_BOTTOM_TABS: readonly CommerceTab[] = [
  { href: "/", labelTr: "Ana", icon: Home },
  { href: "/urunler", labelTr: "Ürünler", icon: ShoppingBag },
  { href: "/sepet", labelTr: "Sepet", icon: ShoppingCart, isCart: true },
  { href: "/hesabim", labelTr: "Hesap", icon: User },
  { href: "/menu", labelTr: "Menü", icon: Menu, opensDrawer: "menu" },
] as const;

// Drawer menu lists everything that didn't fit in bottom tabs — atelier story
// stays first-class here, not buried.
export const MOBILE_DRAWER_LINKS: ReadonlyArray<{
  href: string;
  labelTr: string;
}> = [
  { href: "/portfolyo", labelTr: "Çalışmalarımız" },
  { href: "/hizmetler", labelTr: "Hizmetler" },
  { href: "/hakkimizda", labelTr: "Hakkımızda" },
  { href: "/iletisim", labelTr: "İletişim" },
  { href: "/hesabim/siparislerim", labelTr: "Siparişlerim" },
  { href: "/hesabim/favorilerim", labelTr: "Favorilerim" },
  { href: "/hesabim/adreslerim", labelTr: "Adreslerim" },
  { href: "/gizlilik", labelTr: "Gizlilik & KVKK" },
  { href: "/mesafeli-satis-sozlesmesi", labelTr: "Mesafeli Satış Sözleşmesi" },
  { href: "/iade-politikasi", labelTr: "İade & Kargo" },
  { href: "/cayma-hakki", labelTr: "Cayma Hakkı" },
] as const;
