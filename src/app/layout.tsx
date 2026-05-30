import type { Metadata, Viewport } from "next";
import { Inter, Fraunces } from "next/font/google";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Analytics } from "@vercel/analytics/next";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { CartDrawer } from "@/components/commerce/cart-drawer";
import { BottomTabs } from "@/components/commerce/bottom-tabs";
import { MobileMenuDrawer } from "@/components/commerce/mobile-menu-drawer";
import { InstallPrompt } from "@/components/commerce/install-prompt";
import { SwRegister } from "@/components/commerce/sw-register";
import { SITE } from "@/config/site";
import "./globals.css";

const inter = Inter({
  subsets: ["latin", "latin-ext"],
  variable: "--font-inter",
  display: "swap",
});

const fraunces = Fraunces({
  subsets: ["latin", "latin-ext"],
  variable: "--font-fraunces",
  display: "swap",
  axes: ["SOFT", "opsz"],
});

export const metadata: Metadata = {
  title: {
    default: `${SITE.name} — ${SITE.taglineTr}`,
    template: `%s · ${SITE.shortName}`,
  },
  description: SITE.descriptionTr,
  metadataBase: new URL(SITE.url),
  applicationName: SITE.name,
  authors: [{ name: SITE.legalName }],
  keywords: [
    "özel tasarım mobilya",
    "mimari proje",
    "ev yenileme",
    "İstanbul mobilya atölyesi",
    "custom furniture İstanbul",
    "architectural design İstanbul",
    "Şimşek Mobilya",
  ],
  openGraph: {
    type: "website",
    title: SITE.name,
    description: SITE.descriptionTr,
    siteName: SITE.shortName,
    locale: "tr_TR",
    alternateLocale: "en_US",
  },
  twitter: { card: "summary_large_image", title: SITE.name, description: SITE.descriptionTr },
  formatDetection: { telephone: false },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#FAFAF7" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
  ],
  colorScheme: "light dark",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="tr" className={`${inter.variable} ${fraunces.variable}`} suppressHydrationWarning>
      <head>
        {/* Pre-warm DNS + TCP for the two image origins we hit on the
            critical path. Hero + featured-products + product cards all
            pull from these. Saves ~150ms on first paint over cold
            connections. */}
        <link rel="preconnect" href="https://images.unsplash.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://images.unsplash.com" />
        <link rel="preconnect" href="https://public.blob.vercel-storage.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://public.blob.vercel-storage.com" />
      </head>

      <body className="min-h-dvh font-sans antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <TooltipProvider delayDuration={150}>
            {children}
            <CartDrawer />
            <MobileMenuDrawer />
            <BottomTabs />
            <InstallPrompt />
            <SwRegister />
            <Toaster />
          </TooltipProvider>
        </ThemeProvider>
        <SpeedInsights />
        <Analytics />
      </body>
    </html>
  );
}
