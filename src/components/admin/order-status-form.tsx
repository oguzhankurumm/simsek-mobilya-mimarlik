"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

const STATUSES = [
  { value: "PENDING", label: "Ödeme Bekleniyor" },
  { value: "PAYMENT_RECEIVED", label: "Ödeme Alındı" },
  { value: "PROCESSING", label: "Hazırlanıyor" },
  { value: "SHIPPED", label: "Kargoda" },
  { value: "DELIVERED", label: "Teslim Edildi" },
  { value: "CANCELLED", label: "İptal" },
] as const;

export function OrderStatusForm({
  orderId,
  orderNumber,
  currentStatus,
}: {
  orderId: string;
  orderNumber: string;
  currentStatus: string;
}) {
  const router = useRouter();
  const [status, setStatus] = useState(currentStatus);
  const [pending, startTransition] = useTransition();

  async function save(newStatus: string) {
    startTransition(async () => {
      const res = await fetch(`/api/admin/orders/${orderNumber}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        toast.error(err.error ?? "Güncellenemedi");
        return;
      }
      setStatus(newStatus);
      toast.success("Durum güncellendi");
      router.refresh();
    });
  }

  return (
    <div className="mt-2 flex flex-col gap-2">
      <select
        value={status}
        disabled={pending}
        onChange={(e) => save(e.target.value)}
        className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
        aria-label={`Sipariş ${orderId} durumu`}
      >
        {STATUSES.map((s) => (
          <option key={s.value} value={s.value}>
            {s.label}
          </option>
        ))}
      </select>
      {pending ? (
        <p className="text-[10px] text-zinc-500">Kaydediliyor…</p>
      ) : null}
    </div>
  );
}
