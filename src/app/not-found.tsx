import type { Metadata } from "next";
import Link from "next/link";
import { Home, ShoppingBag, Search } from "lucide-react";

export const metadata: Metadata = {
  title: "Sayfa bulunamadı — Şimşek Mobilya",
};

// Global 404. Mounted at root (src/app/not-found.tsx) so locale-less commerce
// routes + admin routes also fall through here. Marketing routes have their
// own next-intl 404 inside [locale]/.

export default function NotFound() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center px-6 py-12 text-center">
      <p className="text-[10px] font-mono uppercase tracking-widest text-ink-faint">
        404
      </p>
      <h1 className="mt-2 text-display text-4xl tracking-tight md:text-5xl">
        Sayfa bulunamadı
      </h1>
      <p className="mt-4 max-w-md text-sm text-ink-muted md:text-base">
        Aradığınız sayfa taşınmış olabilir veya artık mevcut değil. Aşağıdaki
        bağlantılar size yardımcı olabilir.
      </p>
      <ul className="mt-8 flex flex-wrap items-center justify-center gap-2">
        <li>
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 rounded-full bg-brand px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand/90"
          >
            <Home className="h-4 w-4" /> Anasayfa
          </Link>
        </li>
        <li>
          <Link
            href="/urunler"
            className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background px-5 py-2.5 text-sm font-medium hover:bg-surface-2"
          >
            <ShoppingBag className="h-4 w-4" /> Ürünlere göz at
          </Link>
        </li>
        <li>
          <Link
            href="/siparis-takibi"
            className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background px-5 py-2.5 text-sm font-medium hover:bg-surface-2"
          >
            <Search className="h-4 w-4" /> Sipariş takibi
          </Link>
        </li>
      </ul>
    </main>
  );
}
