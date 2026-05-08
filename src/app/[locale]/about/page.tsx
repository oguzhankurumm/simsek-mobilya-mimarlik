import { setRequestLocale, getTranslations } from "next-intl/server";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { Eyebrow } from "@/components/atoms/eyebrow";
import { Reveal } from "@/components/atoms/reveal";
import { Stats } from "@/components/sections/stats";
import { ContactCta } from "@/components/sections/contact-cta";
import { Button } from "@/components/ui/button";
import { JsonLd } from "@/components/atoms/json-ld";
import { VALUES, MILESTONES } from "@/content/team";
import { SITE } from "@/config/site";
import { shimmerDataUrl } from "@/lib/utils";
import type { Locale } from "@/i18n/routing";

interface PageProps {
  params: Promise<{ locale: Locale }>;
}

export const revalidate = 3600;

// Atelier ve ekip görselleri için kendi işlerimizden seçilmiş hero shots —
// editöryel niyeti yansıtan, materyal/zanaat detayını öne çıkaran kareler.
const ATELIER_IMAGE = "/work/kadikoy-evi/04-mutfak-detay.jpg";
const TEAM_IMAGE = "/work/avrupa-konutlari/03-banyo-lacivert-1.jpg";

export async function generateMetadata({ params }: PageProps) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "about" });
  return {
    title: t("title"),
    description: t("subtitle"),
    alternates: {
      canonical: locale === "tr" ? "/hakkimizda" : "/en/about",
      languages: { tr: "/hakkimizda", en: "/en/about" },
    },
  };
}

export default async function AboutPage({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "about" });
  const isTr = locale === "tr";

  const ld = {
    "@context": "https://schema.org",
    "@type": "AboutPage",
    name: t("title"),
    description: t("subtitle"),
    primaryImageOfPage: { "@type": "ImageObject", url: ATELIER_IMAGE },
    isPartOf: { "@type": "WebSite", name: SITE.name, url: SITE.url },
  };

  return (
    <>
      <JsonLd data={ld} id="ld-about" />

      <section className="container-editorial pt-16 md:pt-24 pb-12">
        <div className="grid gap-10 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <Eyebrow>{isTr ? "HAKKIMIZDA" : "ABOUT"}</Eyebrow>
            <h1 className="text-display text-[clamp(2.5rem,6vw,5rem)] leading-[1.02] tracking-tight mt-5 max-w-[18ch]">
              {t("title")}
            </h1>
            <p className="mt-6 max-w-2xl text-base md:text-lg text-ink-muted leading-relaxed">
              {t("subtitle")}
            </p>
          </div>
          <div className="lg:col-span-5">
            <Reveal>
              <div className="relative aspect-[4/5] w-full overflow-hidden rounded-md bg-surface-2 ring-1 ring-border">
                <Image
                  src={TEAM_IMAGE}
                  alt={isTr ? "Atölye ekibi" : "Atelier team"}
                  fill
                  sizes="(max-width: 1024px) 100vw, 35vw"
                  placeholder="blur"
                  blurDataURL={shimmerDataUrl(28, 35)}
                  className="object-cover"
                />
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      <section className="container-editorial pb-16">
        <Reveal>
          <div className="relative aspect-[16/9] w-full overflow-hidden rounded-lg bg-surface-2">
            <Image
              src={ATELIER_IMAGE}
              alt={isTr ? "Atölyemiz" : "Our atelier"}
              fill
              sizes="100vw"
              placeholder="blur"
              blurDataURL={shimmerDataUrl(40, 22)}
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            <div className="absolute bottom-6 left-6 md:bottom-10 md:left-10 text-white max-w-md">
              <Eyebrow className="!text-white/80">
                {isTr ? "ATÖLYEMİZ" : "OUR ATELIER"}
              </Eyebrow>
              <p
                className="mt-3 text-display text-3xl md:text-4xl leading-tight"
                style={{ fontVariationSettings: '"SOFT" 50, "opsz" 60' }}
              >
                {isTr
                  ? "Tasarım, üretim, kurulum tek çatı altında."
                  : "Design, build, and install under one roof."}
              </p>
            </div>
          </div>
        </Reveal>
      </section>

      <Stats locale={locale} />

      {/* Values */}
      <section className="container-editorial section-y">
        <div className="grid gap-10 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <Reveal>
              <Eyebrow>{t("valuesEyebrow")}</Eyebrow>
              <h2 className="text-display text-[clamp(2rem,4.5vw,3.25rem)] leading-tight tracking-tight mt-5">
                {t("valuesTitle")}
              </h2>
            </Reveal>
          </div>
          <ul className="lg:col-span-8 grid gap-px overflow-hidden rounded-md border border-border bg-border md:grid-cols-2">
            {VALUES.map((v, i) => (
              <li key={i} className="bg-surface-0 p-7 md:p-8">
                <Reveal delayMs={i * 80}>
                  <h3 className="text-display text-xl md:text-2xl tracking-tight">
                    {isTr ? v.titleTr : v.titleEn}
                  </h3>
                  <p className="mt-3 text-sm text-ink-muted leading-relaxed">
                    {isTr ? v.bodyTr : v.bodyEn}
                  </p>
                </Reveal>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Milestones */}
      <section className="container-editorial section-y border-t border-border">
        <div className="max-w-3xl">
          <Reveal>
            <Eyebrow>{t("milestonesEyebrow")}</Eyebrow>
            <h2 className="text-display text-[clamp(2rem,4.5vw,3.25rem)] leading-tight tracking-tight mt-5">
              {t("milestonesTitle")}
            </h2>
          </Reveal>
        </div>

        <ol className="mt-14 relative">
          <span
            className="absolute left-3 md:left-1/2 top-0 bottom-0 w-px bg-border md:-translate-x-1/2"
            aria-hidden
          />
          {MILESTONES.map((m, i) => (
            <li
              key={m.year}
              className={`relative grid gap-3 md:grid-cols-2 mb-12 md:mb-16 last:mb-0 ${
                i % 2 === 0 ? "" : "md:[&>*:first-child]:order-2"
              }`}
            >
              <Reveal delayMs={i * 100}>
                <div className="pl-10 md:pl-0 md:pr-10 md:text-right">
                  <span
                    className="text-display text-5xl md:text-6xl text-brand"
                    style={{ fontVariationSettings: '"SOFT" 100, "opsz" 144' }}
                  >
                    {m.year}
                  </span>
                </div>
              </Reveal>
              <Reveal delayMs={i * 100 + 80}>
                <div className="pl-10 md:pl-10">
                  <span
                    className="absolute left-3 md:left-1/2 top-1.5 w-3 h-3 rounded-full bg-background border-2 border-brand md:-translate-x-1/2"
                    aria-hidden
                  />
                  <h3 className="text-display text-2xl tracking-tight">
                    {isTr ? m.titleTr : m.titleEn}
                  </h3>
                  <p className="mt-2 text-ink-muted max-w-md leading-relaxed">
                    {isTr ? m.bodyTr : m.bodyEn}
                  </p>
                </div>
              </Reveal>
            </li>
          ))}
        </ol>
      </section>

      <section className="container-editorial pb-16">
        <Reveal className="rounded-lg border border-border bg-surface-1 p-8 md:p-12 grid gap-8 lg:grid-cols-12">
          <div className="lg:col-span-8">
            <h2 className="text-display text-3xl md:text-4xl tracking-tight">{t("ctaTitle")}</h2>
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
