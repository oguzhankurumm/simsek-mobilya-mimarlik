import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { QueryProvider } from "@/components/providers/query-provider";
import { ThemeProvider } from "@/components/providers/theme-provider";
import "@/app/globals.css";

// Admin runs outside the [locale] tree — TR-only, no next-intl provider, no
// public site header/footer. Auth guard lives in `admin/dashboard/layout.tsx`
// (added in Phase E) so /admin/login itself can stay public.

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Şimşek Mobilya — Yönetim Paneli",
  robots: { index: false, follow: false },
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="tr" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem={false}
        >
          <QueryProvider>{children}</QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
