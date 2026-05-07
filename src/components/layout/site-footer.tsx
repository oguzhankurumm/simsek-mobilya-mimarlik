import { useTranslations } from "next-intl";
import { Phone, Mail, MapPin } from "lucide-react";
import { InstagramIcon } from "@/components/atoms/icons";
import { Logo } from "@/components/atoms/logo";
import { Link } from "@/i18n/navigation";
import { CONTACT, NAV_ITEMS, SITE, SOCIAL } from "@/config/site";
import type { Locale } from "@/i18n/routing";
import type { ComponentProps } from "react";

interface SiteFooterProps {
  locale: Locale;
}

type AppHref = ComponentProps<typeof Link>["href"];

export function SiteFooter({ locale }: SiteFooterProps) {
  const t = useTranslations("footer");
  const tNav = useTranslations("nav");
  const tContact = useTranslations("contact");
  const year = new Date().getFullYear();
  const isTr = locale === "tr";

  return (
    <footer className="relative border-t border-border bg-surface-1/50 mt-16">
      <div className="container-editorial section-y-tight grid gap-12 lg:grid-cols-12">
        {/* Brand block */}
        <div className="lg:col-span-5 space-y-5">
          <Logo size="lg" withText />
          <p className="text-ink-muted max-w-md leading-relaxed">{t("tagline")}</p>
          <p className="text-ink-muted max-w-md text-sm leading-relaxed">
            {isTr ? SITE.descriptionTr : SITE.descriptionEn}
          </p>
        </div>

        {/* Sitemap */}
        <div className="lg:col-span-3">
          <h3 className="eyebrow !text-ink-faint !before:bg-ink-faint mb-4">
            {t("navTitle")}
          </h3>
          <ul className="space-y-2.5">
            {NAV_ITEMS.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href as AppHref}
                  className="text-ink-muted hover:text-brand transition-colors"
                >
                  {isTr ? item.labelTr : item.labelEn}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Contact + social */}
        <div className="lg:col-span-4 space-y-6">
          <div>
            <h3 className="eyebrow !text-ink-faint !before:bg-ink-faint mb-4">
              {t("contactTitle")}
            </h3>
            <ul className="space-y-2.5 text-ink-muted">
              <li>
                <a
                  href={`tel:${CONTACT.phoneE164}`}
                  className="inline-flex items-center gap-2 hover:text-brand transition-colors"
                >
                  <Phone className="h-3.5 w-3.5" />
                  <span className="tabular-nums">{CONTACT.phoneDisplay}</span>
                </a>
              </li>
              <li>
                <a
                  href={`mailto:${CONTACT.email}`}
                  className="inline-flex items-center gap-2 hover:text-brand transition-colors"
                >
                  <Mail className="h-3.5 w-3.5" />
                  <span>{CONTACT.email}</span>
                </a>
              </li>
              <li className="inline-flex items-center gap-2">
                <MapPin className="h-3.5 w-3.5" />
                <span>
                  {isTr ? CONTACT.address.streetTr : CONTACT.address.streetEn},{" "}
                  {CONTACT.address.city}
                </span>
              </li>
            </ul>
          </div>

          <div className="text-sm">
            <p className="text-ink-faint mb-1">{tContact("hoursLabel")}</p>
            <p className="text-ink-muted">
              {isTr ? CONTACT.hours.weekdaysTr : CONTACT.hours.weekdaysEn}
            </p>
            <p className="text-ink-muted">
              {isTr ? CONTACT.hours.sundayTr : CONTACT.hours.sundayEn}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <a
              href={SOCIAL.instagram.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-md border border-border px-3 py-1.5 text-sm hover:border-brand hover:text-brand transition-colors"
              aria-label={`Instagram @${SOCIAL.instagram.handle}`}
            >
              <InstagramIcon className="h-3.5 w-3.5" />
              <span>@{SOCIAL.instagram.handle}</span>
            </a>
          </div>
        </div>
      </div>

      <div className="container-editorial flex flex-col-reverse md:flex-row items-start md:items-center gap-3 justify-between border-t border-border py-6 text-xs text-ink-faint">
        <p>
          © {year} {SITE.legalName}. {t("rights")}
        </p>
        <p className="flex items-center gap-1.5">
          <span className="brand-bar" aria-hidden />
          {tNav("language")}: {isTr ? "Türkçe" : "English"} · {t("credit")}
        </p>
      </div>
    </footer>
  );
}
