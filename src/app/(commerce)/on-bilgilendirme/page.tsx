import type { Metadata } from "next";
import { ON_BILGILENDIRME } from "@/content/legal/on-bilgilendirme";

export const metadata: Metadata = {
  title: "Ön Bilgilendirme Formu — Şimşek Mobilya",
};

export const revalidate = 3600;

export default function OnBilgilendirmePage() {
  return (
    <article className="container mx-auto max-w-2xl px-4 py-12">
      <header className="mb-8 border-b border-border pb-6">
        <p className="text-[10px] font-mono uppercase tracking-widest text-ink-faint">
          Yasal
        </p>
        <h1 className="mt-1 text-display text-3xl tracking-tight">
          {ON_BILGILENDIRME.title}
        </h1>
        <p className="mt-2 text-xs text-ink-muted">
          Yürürlük: {ON_BILGILENDIRME.effectiveDate}
        </p>
      </header>

      <div className="space-y-5 text-sm leading-relaxed">
        {ON_BILGILENDIRME.sections.map((section) => (
          <section key={section.heading}>
            <h2 className="mb-1.5 text-base font-semibold">
              {section.heading}
            </h2>
            <p>{section.body}</p>
          </section>
        ))}
      </div>
    </article>
  );
}
