import { setRequestLocale, getTranslations } from "next-intl/server";
import { ArrowRight } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { Eyebrow } from "@/components/atoms/eyebrow";
import { Reveal } from "@/components/atoms/reveal";
import { Process } from "@/components/sections/process";
import { ContactCta } from "@/components/sections/contact-cta";
import { JsonLd } from "@/components/atoms/json-ld";
import { Button } from "@/components/ui/button";
import { SERVICES } from "@/content/services";
import { SITE } from "@/config/site";
import type { Locale } from "@/i18n/routing";

interface PageProps {
  params: Promise<{ locale: Locale }>;
}

export const revalidate = 3600;

export async function generateMetadata({ params }: PageProps) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "services" });
  return {
    title: t("title"),
    description: t("subtitle"),
    alternates: {
      canonical: locale === "tr" ? "/hizmetler" : "/en/services",
      languages: { tr: "/hizmetler", en: "/en/services" },
    },
  };
}

export default async function ServicesPage({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "services" });
  const isTr = locale === "tr";

  const ld = {
    "@context": "https://schema.org",
    "@type": "Service",
    provider: { "@type": "Organization", name: SITE.name, url: SITE.url },
    serviceType: SERVICES.map((s) => (isTr ? s.titleTr : s.titleEn)),
    areaServed: "Türkiye",
  };

  return (
    <>
      <JsonLd data={ld} id="ld-services" />
      <section className="container-editorial pt-16 md:pt-24 pb-12">
        <Eyebrow>{isTr ? "HİZMETLER" : "SERVICES"}</Eyebrow>
        <h1 className="text-display text-[clamp(2.5rem,6vw,5rem)] leading-[1.02] tracking-tight mt-5 max-w-[18ch]">
          {t("title")}
        </h1>
        <p className="mt-6 max-w-2xl text-base md:text-lg text-ink-muted leading-relaxed">
          {t("subtitle")}
        </p>
      </section>

      <section className="container-editorial pb-20 grid gap-12 lg:grid-cols-2 lg:gap-16">
        {SERVICES.map((service, i) => {
          const Icon = service.icon;
          const title = isTr ? service.titleTr : service.titleEn;
          const summary = isTr ? service.summaryTr : service.summaryEn;
          const bullets = isTr ? service.bulletsTr : service.bulletsEn;
          return (
            <Reveal key={service.slug} delayMs={i * 80}>
              <article className="group relative h-full rounded-lg border border-border bg-surface-1/60 p-7 md:p-10 hover:bg-surface-1 transition-colors">
                <div className="flex items-start gap-5">
                  <div className="shrink-0 grid h-14 w-14 place-items-center rounded-md bg-ink text-background group-hover:bg-brand transition-colors">
                    <Icon className="h-6 w-6" />
                  </div>
                  <div>
                    <span className="eyebrow !text-ink-faint [&::before]:!bg-ink-faint">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <h2
                      className="text-display text-3xl md:text-4xl tracking-tight mt-3"
                      style={{ fontVariationSettings: '"SOFT" 50, "opsz" 60' }}
                    >
                      {title}
                    </h2>
                  </div>
                </div>
                <p className="mt-6 text-ink-muted leading-relaxed">{summary}</p>
                <ul className="mt-6 grid gap-2 sm:grid-cols-2 text-sm text-ink-muted">
                  {bullets.map((b) => (
                    <li key={b} className="flex items-start gap-2.5">
                      <span className="brand-bar mt-2.5 shrink-0" aria-hidden />
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>
              </article>
            </Reveal>
          );
        })}
      </section>

      <Process locale={locale} />

      <section className="container-editorial section-y">
        <Reveal className="rounded-lg border border-border bg-surface-1 p-8 md:p-12 grid gap-8 lg:grid-cols-12">
          <div className="lg:col-span-8">
            <h2 className="text-display text-3xl md:text-4xl tracking-tight">
              {t("ctaTitle")}
            </h2>
            <p className="mt-3 max-w-xl text-ink-muted leading-relaxed">{t("ctaBody")}</p>
          </div>
          <div className="lg:col-span-4 flex items-end">
            <Button asChild size="lg" className="rounded-full bg-ink text-background h-12 px-6 group">
              <Link href="/contact">
                <span>{t("ctaButton")}</span>
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </Button>
          </div>
        </Reveal>
      </section>

      <ContactCta />
    </>
  );
}
