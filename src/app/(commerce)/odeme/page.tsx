import type { Metadata } from "next";
import { getActiveIbans } from "@/lib/ibans";
import { getActiveWhatsappLine } from "@/lib/whatsapp-lines";
import { getCurrentUser } from "@/lib/get-user";
import { CheckoutFlow } from "./checkout-flow";

export const metadata: Metadata = {
  title: "Ödeme — Şimşek Mobilya",
  robots: { index: false, follow: false },
};

export default async function CheckoutPage() {
  // Fetched server-side and passed as props — the client component owns step
  // state (zustand cart) but data is SSR-rendered for fast first paint.
  const [ibans, whatsapp, user] = await Promise.all([
    getActiveIbans(),
    getActiveWhatsappLine(),
    getCurrentUser(),
  ]);

  // Guests must supply name + phone at checkout (the order route enforces it);
  // logged-in users already have those on their account.
  return <CheckoutFlow ibans={ibans} whatsapp={whatsapp} isGuest={!user} />;
}
