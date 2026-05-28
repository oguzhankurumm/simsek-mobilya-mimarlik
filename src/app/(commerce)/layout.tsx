import type { Metadata } from "next";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, setRequestLocale } from "next-intl/server";
import { QueryProvider } from "@/components/providers/query-provider";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";

// TR-only e-commerce surface. No locale segment in URL.
// Cart drawer + bottom tabs + React Query live here so marketing pages stay
// RSC-pure and lean.

export const metadata: Metadata = {
  robots: { index: true, follow: true },
};

export default async function CommerceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  setRequestLocale("tr");
  const messages = await getMessages({ locale: "tr" });

  return (
    <NextIntlClientProvider locale="tr" messages={messages}>
      <QueryProvider>
        <div className="flex min-h-dvh flex-col pb-16 md:pb-0">
          <SiteHeader locale="tr" />
          <main className="flex-1">{children}</main>
          <SiteFooter locale="tr" />
        </div>
        {/* BottomTabs + CartDrawer mount placeholders — wired up in Phase B */}
      </QueryProvider>
    </NextIntlClientProvider>
  );
}
