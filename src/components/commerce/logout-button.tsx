"use client";

import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { toast } from "sonner";

export function LogoutButton() {
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    toast.success("Çıkış yapıldı");
    router.replace("/");
    router.refresh();
  }

  return (
    <button
      onClick={handleLogout}
      className="hidden items-center gap-1.5 rounded-full border border-border px-4 py-2 text-xs font-medium text-ink-muted hover:bg-surface-2 md:inline-flex"
    >
      <LogOut className="h-3.5 w-3.5" />
      Çıkış Yap
    </button>
  );
}
