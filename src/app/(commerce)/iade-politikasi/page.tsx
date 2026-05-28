import type { Metadata } from "next";
import { IADE_POLITIKASI } from "@/content/legal/iade-politikasi";

export const metadata: Metadata = {
  title: "İade & Kargo Politikası — Şimşek Mobilya",
};

export const revalidate = 3600;

export default function IadePolitikasiPage() {
  return (
    <article className="container mx-auto max-w-2xl px-4 py-12">
      <header className="mb-8 border-b border-border pb-6">
        <p className="text-[10px] font-mono uppercase tracking-widest text-ink-faint">
          Yasal
        </p>
        <h1 className="mt-1 text-display text-3xl tracking-tight">
          {IADE_POLITIKASI.title}
        </h1>
        <p className="mt-2 text-xs text-ink-muted">
          Yürürlük: {IADE_POLITIKASI.effectiveDate}
        </p>
      </header>

      <div className="space-y-6 text-sm leading-relaxed">
        {IADE_POLITIKASI.sections.map((section) => (
          <section key={section.heading}>
            <h2 className="mb-2 text-base font-semibold">{section.heading}</h2>
            <p>{section.body}</p>
          </section>
        ))}
      </div>
    </article>
  );
}
