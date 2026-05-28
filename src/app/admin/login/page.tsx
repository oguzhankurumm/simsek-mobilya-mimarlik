import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Giriş — Yönetim Paneli",
};

export default function AdminLoginPage() {
  return (
    <main className="flex min-h-dvh items-center justify-center bg-zinc-50 px-4">
      <div className="w-full max-w-sm rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm">
        <h1 className="text-xl font-semibold">Yönetim Girişi</h1>
        <p className="mt-2 text-sm text-zinc-500">
          Phase E&apos;de form burada yer alacak (email + şifre → JWT cookie).
        </p>
      </div>
    </main>
  );
}
