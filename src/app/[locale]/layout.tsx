import { notFound } from "next/navigation";
import { setRequestLocale, getMessages } from "next-intl/server";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { routing, type Locale } from "@/i18n/routing";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { StickyContactBar } from "@/components/layout/sticky-contact-bar";
import { CookieBanner } from "@/components/atoms/cookie-banner";
import { getPublicSiteSettings } from "@/lib/site-settings";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);
  const [messages, settings] = await Promise.all([
    getMessages(),
    getPublicSiteSettings(),
  ]);

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      <div className="flex min-h-dvh flex-col pb-16 md:pb-0">
        <SiteHeader locale={locale as Locale} />
        <main className="flex-1">{children}</main>
        <SiteFooter
          locale={locale as Locale}
          legal={{
            vkn: settings.vkn,
            mersisNo: settings.mersisNo,
            etbisNo: settings.etbisNo,
            legalAddress: settings.legalAddress,
          }}
        />
      </div>
      <StickyContactBar />
      <CookieBanner />
    </NextIntlClientProvider>
  );
}
