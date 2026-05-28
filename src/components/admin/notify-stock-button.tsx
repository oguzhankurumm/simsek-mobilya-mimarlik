"use client";

import { useState } from "react";
import { Bell } from "lucide-react";
import { toast } from "sonner";

interface NotifyStockButtonProps {
  productId: string;
  pendingCount: number;
  stockAvailable: boolean;
}

// Shows up on the product edit page when there are pending stock alerts.
// Disabled until the product actually has stock (server-side check too).

export function NotifyStockButton({
  productId,
  pendingCount,
  stockAvailable,
}: NotifyStockButtonProps) {
  const [busy, setBusy] = useState(false);

  if (pendingCount === 0) return null;

  async function handleClick() {
    if (!stockAvailable) {
      toast.error("Önce ürün stoğunu artırın");
      return;
    }
    if (
      !confirm(
        `${pendingCount} aboneye bildirim e-postası gönderilecek. Devam edilsin mi?`,
      )
    )
      return;

    setBusy(true);
    const res = await fetch(`/api/admin/products/${productId}/notify-stock`, {
      method: "POST",
    });
    setBusy(false);
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      toast.error(err.error ?? "Gönderilemedi");
      return;
    }
    const data = (await res.json()) as { sent: number; total: number };
    toast.success(`${data.sent}/${data.total} bildirim gönderildi`);
  }

  return (
    <div className="rounded-xl border border-amber-300 bg-amber-50 p-4 dark:border-amber-800 dark:bg-amber-950">
      <p className="text-sm font-semibold text-amber-900 dark:text-amber-100">
        {pendingCount} müşteri bu ürün için bildirim bekliyor
      </p>
      <p className="mt-1 text-xs text-amber-900/80 dark:text-amber-200/80">
        Stoğu artırdıktan sonra abonelere e-posta gönderin.
      </p>
      <button
        type="button"
        onClick={handleClick}
        disabled={busy || !stockAvailable}
        className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-amber-600 px-4 py-2 text-xs font-semibold text-white hover:bg-amber-700 disabled:cursor-not-allowed disabled:opacity-50"
      >
        <Bell className="h-3.5 w-3.5" />
        {busy ? "Gönderiliyor…" : "Bekleyen abonelere e-posta gönder"}
      </button>
    </div>
  );
}
