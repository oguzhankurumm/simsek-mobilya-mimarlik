import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { LoginForm } from "@/components/commerce/auth-forms";
import { getCurrentUser } from "@/lib/get-user";

export const metadata: Metadata = {
  title: "Giriş — Yönetim Paneli",
  robots: { index: false, follow: false },
};

export default async function AdminLoginPage() {
  const user = await getCurrentUser({ admin: true });
  if (user) redirect("/admin/dashboard");

  return (
    <main className="flex min-h-dvh items-center justify-center bg-zinc-50 px-4 dark:bg-zinc-950">
      <div className="w-full max-w-sm rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <div className="mb-6 text-center">
          <p className="text-[10px] font-mono uppercase tracking-widest text-zinc-500">
            Şimşek Mobilya
          </p>
          <h1 className="mt-1 text-xl font-semibold">Yönetim Girişi</h1>
        </div>
        <LoginForm isAdmin redirectTo="/admin/dashboard" />
      </div>
    </main>
  );
}
