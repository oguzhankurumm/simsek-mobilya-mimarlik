import type { Metadata } from "next";
import { getActiveIbans } from "@/lib/ibans";
import { getActiveWhatsappLine } from "@/lib/whatsapp-lines";
import { CheckoutFlow } from "./checkout-flow";

export const metadata: Metadata = {
  title: "Ödeme — Şimşek Mobilya",
  robots: { index: false, follow: false },
};

export default async function CheckoutPage() {
  // Fetched server-side and passed as props — the client component owns step
  // state (zustand cart) but data is SSR-rendered for fast first paint.
  const [ibans, whatsapp] = await Promise.all([
    getActiveIbans(),
    getActiveWhatsappLine(),
  ]);

  return <CheckoutFlow ibans={ibans} whatsapp={whatsapp} />;
}
