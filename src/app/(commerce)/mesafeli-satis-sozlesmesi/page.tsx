import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { MESAFELI_SATIS } from "@/content/legal/mesafeli-satis";

export const metadata: Metadata = {
  title: "Mesafeli Satış Sözleşmesi — Şimşek Mobilya",
};

export const revalidate = 3600;

async function getLegalSettings() {
  try {
    const s = await prisma.siteSettings.findUnique({
      where: { id: "singleton" },
    });
    return {
      vkn: s?.vkn ?? "",
      mersisNo: s?.mersisNo ?? "",
      etbisNo: s?.etbisNo ?? "",
      legalAddress: s?.legalAddress ?? "",
    };
  } catch {
    return { vkn: "", mersisNo: "", etbisNo: "", legalAddress: "" };
  }
}

export default async function MesafeliSatisPage() {
  const settings = await getLegalSettings();
  return (
    <article className="container mx-auto max-w-2xl px-4 py-12">
      <header className="mb-8 border-b border-border pb-6">
        <p className="text-[10px] font-mono uppercase tracking-widest text-ink-faint">
          Yasal
        </p>
        <h1 className="mt-1 text-display text-3xl tracking-tight">
          {MESAFELI_SATIS.title}
        </h1>
        <p className="mt-2 text-xs text-ink-muted">
          Yürürlük: {MESAFELI_SATIS.effectiveDate}
        </p>
      </header>

      <section className="space-y-3 text-sm text-ink">
        <h2 className="text-base font-semibold">Satıcı Bilgileri</h2>
        <dl className="grid grid-cols-1 gap-2 rounded-lg border border-border bg-surface-2/40 p-4 text-xs md:grid-cols-2">
          <Field label="Ticari Unvan" value={MESAFELI_SATIS.sellerInfo.legalName} />
          <Field label="Adres" value={settings.legalAddress || MESAFELI_SATIS.sellerInfo.address} />
          <Field label="VKN" value={settings.vkn || "—"} />
          <Field label="MERSIS No" value={settings.mersisNo || "—"} />
          <Field label="ETBİS Belge No" value={settings.etbisNo || "—"} />
          <Field label="E-posta" value={MESAFELI_SATIS.sellerInfo.email} />
          <Field label="Telefon" value={MESAFELI_SATIS.sellerInfo.phone} />
        </dl>
      </section>

      <div className="mt-8 space-y-6 text-sm leading-relaxed">
        {MESAFELI_SATIS.sections.map((section) => (
          <section key={section.heading}>
            <h2 className="mb-2 text-base font-semibold">{section.heading}</h2>
            <p className="text-ink">{section.body}</p>
          </section>
        ))}
      </div>

      <p className="mt-12 text-xs text-ink-faint">
        Bu metin Mesafeli Sözleşmeler Yönetmeliği gereğince yayımlanmıştır.
        Sözleşmenin tamamı, sipariş onayı sırasında müşteriye ayrıca sunulur.
      </p>
    </article>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-[10px] uppercase tracking-widest text-ink-faint">
        {label}
      </dt>
      <dd className="mt-0.5 text-ink">{value}</dd>
    </div>
  );
}
