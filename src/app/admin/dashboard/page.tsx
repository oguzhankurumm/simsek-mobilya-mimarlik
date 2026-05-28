import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard — Yönetim Paneli",
};

export default function AdminDashboardPage() {
  return (
    <main className="container mx-auto px-6 py-10">
      <h1 className="text-2xl font-semibold">Dashboard</h1>
      <p className="mt-2 text-sm text-zinc-500">
        Phase E&apos;de inşa ediliyor — metric cards + son 10 sipariş tablosu.
      </p>
    </main>
  );
}
