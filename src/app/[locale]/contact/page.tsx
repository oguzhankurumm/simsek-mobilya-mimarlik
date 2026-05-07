import { setRequestLocale, getTranslations } from "next-intl/server";
import { Phone, Mail, MapPin, MessageCircle, Clock } from "lucide-react";
import { InstagramIcon } from "@/components/atoms/icons";
import { Eyebrow } from "@/components/atoms/eyebrow";
import { Reveal } from "@/components/atoms/reveal";
import { ContactForm } from "@/components/contact/contact-form";
import { JsonLd } from "@/components/atoms/json-ld";
import { CONTACT, SITE, SOCIAL } from "@/config/site";
import type { Locale } from "@/i18n/routing";

interface PageProps {
  params: Promise<{ locale: Locale }>;
}

export const revalidate = 3600;

export async function generateMetadata({ params }: PageProps) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "contact" });
  return {
    title: t("title"),
    description: t("subtitle"),
    alternates: {
      canonical: locale === "tr" ? "/iletisim" : "/en/contact",
      languages: { tr: "/iletisim", en: "/en/contact" },
    },
  };
}

export default async function ContactPage({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "contact" });
  const isTr = locale === "tr";

  const ld = {
    "@context": "https://schema.org",
    "@type": "ContactPage",
    name: t("title"),
    description: t("subtitle"),
    mainEntity: {
      "@type": ["Organization", "FurnitureStore"],
      name: SITE.name,
      telephone: CONTACT.phoneE164,
      email: CONTACT.email,
      url: SITE.url,
      address: {
        "@type": "PostalAddress",
        addressLocality: CONTACT.address.city,
        addressCountry: CONTACT.address.countryCode,
      },
      sameAs: [SOCIAL.instagram.url],
    },
  };

  return (
    <>
      <JsonLd data={ld} id="ld-contact" />

      <section className="container-editorial pt-16 md:pt-24 pb-10">
        <Eyebrow>{isTr ? "İLETİŞİM" : "CONTACT"}</Eyebrow>
        <h1 className="text-display text-[clamp(2.5rem,6vw,5rem)] leading-[1.02] tracking-tight mt-5 max-w-[18ch]">
          {t("title")}
        </h1>
        <p className="mt-6 max-w-2xl text-base md:text-lg text-ink-muted leading-relaxed">
          {t("subtitle")}
        </p>
      </section>

      <section className="container-editorial pb-24 grid gap-10 lg:grid-cols-12 lg:gap-16">
        {/* Sidebar — direct channels */}
        <aside className="lg:col-span-4 space-y-7">
          <Reveal>
            <ChannelCard
              icon={Phone}
              label={t("phoneLabel")}
              value={CONTACT.phoneDisplay}
              href={`tel:${CONTACT.phoneE164}`}
            />
          </Reveal>
          <Reveal delayMs={80}>
            <ChannelCard
              icon={MessageCircle}
              label={t("whatsappLabel")}
              value={isTr ? "Hemen yazışın" : "Message now"}
              href={SOCIAL.whatsapp.url}
              external
              accent
            />
          </Reveal>
          <Reveal delayMs={160}>
            <ChannelCard
              icon={Mail}
              label={t("emailLabel")}
              value={CONTACT.email}
              href={`mailto:${CONTACT.email}`}
            />
          </Reveal>
          <Reveal delayMs={240}>
            <ChannelCard
              icon={InstagramIcon}
              label={t("instagramLabel")}
              value={`@${SOCIAL.instagram.handle}`}
              href={SOCIAL.instagram.url}
              external
            />
          </Reveal>

          <div className="rounded-lg border border-border p-5 mt-2">
            <div className="flex items-start gap-3">
              <Clock className="h-4 w-4 text-ink-faint shrink-0 mt-0.5" />
              <div>
                <p className="eyebrow !text-ink-faint [&::before]:!bg-ink-faint">
                  {t("hoursLabel")}
                </p>
                <p className="mt-2 text-ink">
                  {isTr ? CONTACT.hours.weekdaysTr : CONTACT.hours.weekdaysEn}
                </p>
                <p className="text-ink-muted">
                  {isTr ? CONTACT.hours.sundayTr : CONTACT.hours.sundayEn}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-border p-5">
            <div className="flex items-start gap-3">
              <MapPin className="h-4 w-4 text-ink-faint shrink-0 mt-0.5" />
              <div>
                <p className="eyebrow !text-ink-faint [&::before]:!bg-ink-faint">
                  {t("addressLabel")}
                </p>
                <p className="mt-2 text-ink">
                  {isTr ? CONTACT.address.streetTr : CONTACT.address.streetEn}
                </p>
                <p className="text-ink-muted">
                  {CONTACT.address.city}, {CONTACT.address.country}
                </p>
              </div>
            </div>
          </div>
        </aside>

        {/* Form */}
        <div className="lg:col-span-8">
          <Reveal>
            <div className="rounded-lg border border-border bg-surface-1/50 p-7 md:p-10">
              <ContactForm locale={locale} />
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}

function ChannelCard({
  icon: Icon,
  label,
  value,
  href,
  external,
  accent,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  href: string;
  external?: boolean;
  accent?: boolean;
}) {
  return (
    <a
      href={href}
      {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      className={`group flex items-start gap-4 rounded-lg border border-border p-5 transition-colors hover:border-ink ${
        accent ? "bg-brand/5 hover:bg-brand/10 hover:border-brand" : "bg-surface-1/40 hover:bg-surface-1"
      }`}
    >
      <span
        className={`grid h-10 w-10 shrink-0 place-items-center rounded-md ${
          accent ? "bg-brand text-white" : "bg-ink text-background group-hover:bg-brand"
        } transition-colors`}
      >
        <Icon className="h-4 w-4" />
      </span>
      <div className="flex-1">
        <p className="eyebrow !text-ink-faint [&::before]:!bg-ink-faint">{label}</p>
        <p className="mt-1 text-ink font-medium">{value}</p>
      </div>
    </a>
  );
}
