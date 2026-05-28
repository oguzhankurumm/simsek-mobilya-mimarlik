import type { Metadata } from "next";
import { RegisterForm } from "@/components/commerce/auth-forms";

export const metadata: Metadata = {
  title: "Hesap Oluştur — Şimşek Mobilya",
  robots: { index: false, follow: false },
};

export default function RegisterPage() {
  return (
    <section className="container mx-auto max-w-md px-4 py-12">
      <div className="mb-6 text-center">
        <h1 className="text-display text-3xl tracking-tight">Hesap Oluştur</h1>
        <p className="mt-2 text-sm text-ink-muted">
          Sipariş takibi ve favori kayıt için ücretsiz.
        </p>
      </div>
      <div className="rounded-2xl border border-border bg-background p-6 md:p-8">
        <RegisterForm />
      </div>
    </section>
  );
}
