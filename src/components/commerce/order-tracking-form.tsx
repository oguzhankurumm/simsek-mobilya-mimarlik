"use client";

import { useState } from "react";
import { toast } from "sonner";
import { CheckCircle2, Package } from "lucide-react";
import { formatPrice } from "@/lib/money";

const fieldStyles =
  "w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-ink placeholder:text-ink-faint focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20";

const STATUS_LABEL: Record<string, string> = {
  PENDING: "Ödeme Bekleniyor",
  PAYMENT_RECEIVED: "Ödeme Alındı",
  PROCESSING: "Hazırlanıyor",
  SHIPPED: "Kargoda",
  DELIVERED: "Teslim Edildi",
  CANCELLED: "İptal",
};

interface TrackingResult {
  orderNumber: string;
  status: string;
  totalAmountKurus: number;
  createdAt: string;
  itemCount: number;
}

export function OrderTrackingForm() {
  const [result, setResult] = useState<TrackingResult | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const orderNumber = String(form.get("orderNumber") ?? "").trim();
    const phoneLast4 = String(form.get("phoneLast4") ?? "").trim();
    if (!orderNumber || phoneLast4.length !== 4) {
      toast.error("Sipariş numarası ve telefon son 4 hane zorunludur.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(
        `/api/orders/track?orderNumber=${encodeURIComponent(orderNumber)}&phoneLast4=${encodeURIComponent(phoneLast4)}`,
      );
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        toast.error(err.error ?? "Sipariş bulunamadı");
        setResult(null);
        return;
      }
      setResult(await res.json());
    } finally {
      setLoading(false);
    }
  }

  if (result) {
    return (
      <div className="space-y-4">
        <div className="flex flex-col items-center gap-2 py-3 text-center">
          <CheckCircle2 className="h-10 w-10 text-emerald-500" />
          <p className="font-semibold tabular-nums">{result.orderNumber}</p>
          <p className="text-xs text-ink-muted">
            {new Date(result.createdAt).toLocaleString("tr-TR")}
          </p>
        </div>
        <dl className="grid grid-cols-2 gap-3 text-sm">
          <div className="rounded-xl border border-border p-3">
            <dt className="text-[10px] uppercase tracking-widest text-ink-faint">
              Durum
            </dt>
            <dd className="mt-1 font-medium">
              {STATUS_LABEL[result.status] ?? result.status}
            </dd>
          </div>
          <div className="rounded-xl border border-border p-3">
            <dt className="text-[10px] uppercase tracking-widest text-ink-faint">
              Tutar
            </dt>
            <dd className="mt-1 font-semibold tabular-nums">
              {formatPrice(result.totalAmountKurus)}
            </dd>
          </div>
        </dl>
        <p className="text-center text-xs text-ink-muted">
          <Package className="mr-1 inline h-3 w-3" />
          {result.itemCount} ürün
        </p>
        <button
          type="button"
          onClick={() => setResult(null)}
          className="w-full rounded-full border border-border py-2.5 text-sm text-ink hover:bg-surface-2"
        >
          Yeni Sorgu
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <label className="block">
        <span className="mb-1.5 block text-xs uppercase tracking-wide text-ink-muted">
          Sipariş Numarası
        </span>
        <input
          name="orderNumber"
          placeholder="SM-XXXXXXXX"
          required
          className={fieldStyles + " uppercase"}
        />
      </label>
      <label className="block">
        <span className="mb-1.5 block text-xs uppercase tracking-wide text-ink-muted">
          Telefon (son 4 hane)
        </span>
        <input
          name="phoneLast4"
          inputMode="numeric"
          pattern="[0-9]{4}"
          maxLength={4}
          required
          placeholder="3919"
          className={fieldStyles + " tabular-nums"}
        />
      </label>
      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-full bg-brand py-3 text-sm font-semibold text-white hover:bg-brand/90 disabled:opacity-60"
      >
        {loading ? "Sorgulanıyor…" : "Sipariş Durumunu Göster"}
      </button>
    </form>
  );
}
