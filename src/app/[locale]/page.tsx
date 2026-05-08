import { setRequestLocale, getTranslations } from "next-intl/server";
import { Hero } from "@/components/sections/hero";
import { Manifesto } from "@/components/sections/manifesto";
import { FeaturedProjects } from "@/components/sections/featured-projects";
import { ServicesPreview } from "@/components/sections/services-preview";
import { Process } from "@/components/sections/process";
import { Stats } from "@/components/sections/stats";
import { InstagramStrip } from "@/components/sections/instagram-strip";
import { Testimonials } from "@/components/sections/testimonials";
import { ContactCta } from "@/components/sections/contact-cta";
import { JsonLd } from "@/components/atoms/json-ld";
import { CONTACT, SITE, SOCIAL } from "@/config/site";
import type { Locale } from "@/i18n/routing";

interface PageProps {
  params: Promise<{ locale: Locale }>;
}

export const revalidate = 3600;

export async function generateMetadata({ params }: PageProps) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "brand" });
  const description = t("description");
  return {
    title: `${t("name")} — ${t("tagline")}`,
    description,
    alternates: {
      canonical: locale === "tr" ? "/" : "/en",
      languages: { tr: "/", en: "/en" },
    },
    openGraph: {
      title: t("name"),
      description,
      url: locale === "tr" ? "/" : "/en",
      type: "website",
    },
  };
}

export default async function HomePage({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  const orgLd = {
    "@context": "https://schema.org",
    "@type": ["Organization", "FurnitureStore", "GeneralContractor"],
    name: SITE.name,
    alternateName: SITE.shortName,
    url: SITE.url,
    logo: `${SITE.url}/logo.png`,
    description: locale === "tr" ? SITE.descriptionTr : SITE.descriptionEn,
    foundingDate: String(SITE.foundedYear),
    telephone: CONTACT.phoneE164,
    email: CONTACT.email,
    address: {
      "@type": "PostalAddress",
      addressLocality: CONTACT.address.city,
      addressCountry: CONTACT.address.countryCode,
    },
    sameAs: [SOCIAL.instagram.url],
    areaServed: { "@type": "Country", name: "Türkiye" },
  };

  return (
    <>
      <JsonLd data={orgLd} id="ld-home-org" />
      <Hero />
      <Manifesto />
      <FeaturedProjects locale={locale} />
      <Stats locale={locale} />
      <Testimonials locale={locale} />
      <ServicesPreview locale={locale} />
      <Process locale={locale} />
      <InstagramStrip locale={locale} />
      <ContactCta />
    </>
  );
}
