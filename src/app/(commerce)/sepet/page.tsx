import type { Metadata } from "next";
import { CartPageClient } from "./cart-page-client";

export const metadata: Metadata = {
  title: "Sepetim — Şimşek Mobilya",
  robots: { index: false, follow: false },
};

// Route fallback. /sepet bottom-tab normally opens the cart drawer, but
// direct-linking, deep-linking from WhatsApp, or no-JS clients reach this
// page instead. Renders the same store contents in a full-page layout.

export default function CartPage() {
  return <CartPageClient />;
}
