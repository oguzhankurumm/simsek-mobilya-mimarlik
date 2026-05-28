import type { Metadata } from "next";
import { CAYMA_HAKKI } from "@/content/legal/cayma-hakki";

export const metadata: Metadata = {
  title: "Cayma Hakkı — Şimşek Mobilya",
};

export const revalidate = 3600;

export default function CaymaHakkiPage() {
  return (
    <article className="container mx-auto max-w-2xl px-4 py-12">
      <header className="mb-8 border-b border-border pb-6">
        <p className="text-[10px] font-mono uppercase tracking-widest text-ink-faint">
          Yasal
        </p>
        <h1 className="mt-1 text-display text-3xl tracking-tight">
          {CAYMA_HAKKI.title}
        </h1>
        <p className="mt-2 text-xs text-ink-muted">
          Yürürlük: {CAYMA_HAKKI.effectiveDate}
        </p>
      </header>

      <div className="whitespace-pre-line text-sm leading-relaxed">
        {CAYMA_HAKKI.body}
      </div>
    </article>
  );
}
