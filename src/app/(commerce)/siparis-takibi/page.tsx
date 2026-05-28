import type { Metadata } from "next";
import { OrderTrackingForm } from "@/components/commerce/order-tracking-form";

export const metadata: Metadata = {
  title: "Sipariş Takibi — Şimşek Mobilya",
  robots: { index: false, follow: false },
};

// Guest-friendly tracking. The user types orderNumber + last 4 digits of the
// phone they ordered with — both required to defeat enumeration attacks on
// orderNumber alone (Phase 2/3 review T20).

export default function OrderTrackingPage() {
  return (
    <section className="container mx-auto max-w-md px-4 py-12">
      <div className="mb-6 text-center">
        <h1 className="text-display text-3xl tracking-tight">Sipariş Takibi</h1>
        <p className="mt-2 text-sm text-ink-muted">
          Sipariş numaranızı ve telefonunuzun son 4 hanesini girin.
        </p>
      </div>
      <div className="rounded-2xl border border-border bg-background p-6">
        <OrderTrackingForm />
      </div>
    </section>
  );
}
