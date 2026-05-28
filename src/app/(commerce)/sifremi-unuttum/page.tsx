import type { Metadata } from "next";
import { ForgotPasswordForm } from "@/components/commerce/auth-forms";

export const metadata: Metadata = {
  title: "Şifremi Unuttum — Şimşek Mobilya",
  robots: { index: false, follow: false },
};

export default function ForgotPage() {
  return (
    <section className="container mx-auto max-w-md px-4 py-12">
      <div className="mb-6 text-center">
        <h1 className="text-display text-3xl tracking-tight">Şifremi Unuttum</h1>
        <p className="mt-2 text-sm text-ink-muted">
          E-postanıza 6 haneli kod göndereceğiz.
        </p>
      </div>
      <div className="rounded-2xl border border-border bg-background p-6 md:p-8">
        <ForgotPasswordForm />
      </div>
    </section>
  );
}
