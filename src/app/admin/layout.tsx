import type { Metadata } from "next";
import { QueryProvider } from "@/components/providers/query-provider";

// Admin layout — TR-only, no next-intl, no public site header/footer, no
// bottom tabs (those mount at the root layout but BottomTabs itself returns
// null on /admin paths). Auth guard lives in `admin/dashboard/layout.tsx`
// (added in Phase E) so /admin/login can stay public.

export const metadata: Metadata = {
  title: "Şimşek Mobilya — Yönetim Paneli",
  robots: { index: false, follow: false },
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <QueryProvider>{children}</QueryProvider>;
}
