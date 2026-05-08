import { setRequestLocale } from "next-intl/server";
import { Eyebrow } from "@/components/atoms/eyebrow";
import { JsonLd } from "@/components/atoms/json-ld";
import { PRIVACY_TR, PRIVACY_EN } from "@/content/legal";
import { SITE } from "@/config/site";
import type { Locale } from "@/i18n/routing";

interface PageProps {
  params: Promise<{ locale: Locale }>;
}

export const revalidate = 86400;

export async function generateMetadata({ params }: PageProps) {
  const { locale } = await params;
  const data = locale === "tr" ? PRIVACY_TR : PRIVACY_EN;
  return {
    title: data.title,
    description: data.intro.slice(0, 160),
    alternates: {
      canonical: locale === "tr" ? "/kvkk" : "/en/privacy",
      languages: { tr: "/kvkk", en: "/en/privacy" },
    },
    robots: { index: true, follow: true },
  };
}

export default async function PrivacyPage({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  const data = locale === "tr" ? PRIVACY_TR : PRIVACY_EN;

  const ld = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: data.title,
    description: data.intro,
    isPartOf: { "@type": "WebSite", name: SITE.name, url: SITE.url },
  };

  return (
    <>
      <JsonLd data={ld} id="ld-privacy" />
      <article className="container-editorial pt-16 md:pt-24 pb-24 max-w-3xl">
        <Eyebrow>{locale === "tr" ? "YASAL" : "LEGAL"}</Eyebrow>
        <h1 className="text-display text-[clamp(2rem,5vw,3.5rem)] leading-[1.05] tracking-tight mt-5">
          {data.title}
        </h1>
        <p className="mt-3 text-sm text-ink-faint">{data.updated}</p>
        <p className="mt-8 text-base md:text-lg text-ink-muted leading-relaxed">
          {data.intro}
        </p>

        <div className="mt-12 space-y-10">
          {data.sections.map((s) => (
            <section key={s.heading}>
              <h2 className="text-display text-xl md:text-2xl tracking-tight">
                {s.heading}
              </h2>
              <p className="mt-3 text-ink-muted leading-relaxed whitespace-pre-line">
                {s.body}
              </p>
            </section>
          ))}
        </div>
      </article>
    </>
  );
}
