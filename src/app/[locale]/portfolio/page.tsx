import { setRequestLocale, getTranslations } from "next-intl/server";
import { Eyebrow } from "@/components/atoms/eyebrow";
import { CategoryFilter } from "@/components/portfolio/category-filter";
import { JsonLd } from "@/components/atoms/json-ld";
import { ContactCta } from "@/components/sections/contact-cta";
import { PROJECTS } from "@/content/projects";
import { SITE } from "@/config/site";
import type { Locale } from "@/i18n/routing";

interface PageProps {
  params: Promise<{ locale: Locale }>;
}

export const revalidate = 3600;

export async function generateMetadata({ params }: PageProps) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "portfolio" });
  return {
    title: t("title"),
    description: t("subtitle"),
    alternates: {
      canonical: locale === "tr" ? "/calismalar" : "/en/work",
      languages: { tr: "/calismalar", en: "/en/work" },
    },
    openGraph: {
      title: `${t("title")} · ${SITE.shortName}`,
      description: t("subtitle"),
    },
  };
}

export default async function PortfolioPage({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "portfolio" });

  const ld = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: t("title"),
    itemListElement: PROJECTS.map((p, i) => ({
      "@type": "ListItem",
      position: i + 1,
      url: `${SITE.url}${locale === "tr" ? "/calismalar" : "/en/work"}/${p.slug}`,
      name: locale === "tr" ? p.titleTr : p.titleEn,
    })),
  };

  return (
    <>
      <JsonLd data={ld} id="ld-portfolio" />
      <section className="container-editorial pt-16 md:pt-24 pb-10 md:pb-14">
        <Eyebrow>{locale === "tr" ? "ÇALIŞMALARIMIZ" : "OUR WORK"}</Eyebrow>
        <h1 className="text-display text-[clamp(2.5rem,6vw,5rem)] leading-[1.02] tracking-tight mt-5 max-w-[18ch]">
          {t("title")}
        </h1>
        <p className="mt-6 max-w-2xl text-base md:text-lg text-ink-muted leading-relaxed">
          {t("subtitle")}
        </p>
      </section>

      <section className="container-editorial pb-24">
        <CategoryFilter locale={locale} />
      </section>

      <ContactCta />
    </>
  );
}
