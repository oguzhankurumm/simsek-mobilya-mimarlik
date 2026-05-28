"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { XCircle } from "lucide-react";

interface CancelOrderButtonProps {
  orderNumber: string;
}

// Only mounted on PENDING customer orders. Asks for confirmation, then hits
// /api/orders/[N]/cancel which restores stock + emails the customer.

export function CancelOrderButton({ orderNumber }: CancelOrderButtonProps) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function handleClick() {
    if (
      !confirm(
        "Siparişi iptal etmek istediğine emin misin? Henüz ödeme almadıysak hemen iptal olur.",
      )
    )
      return;
    setBusy(true);
    const res = await fetch(`/api/orders/${orderNumber}/cancel`, {
      method: "POST",
    });
    setBusy(false);
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      toast.error(err.error ?? "İptal başarısız");
      return;
    }
    toast.success("Sipariş iptal edildi");
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={busy}
      className="inline-flex items-center gap-1.5 rounded-full border border-red-300 px-4 py-2 text-xs font-medium text-red-700 hover:bg-red-50 disabled:opacity-60 dark:border-red-800 dark:hover:bg-red-950"
    >
      <XCircle className="h-3.5 w-3.5" />
      {busy ? "İptal ediliyor…" : "Siparişi İptal Et"}
    </button>
  );
}
