"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Download } from "lucide-react";
import { cn } from "@/lib/utils";

const STATUS_LABEL: Record<string, string> = {
  PENDING: "Bekliyor",
  PAYMENT_RECEIVED: "Ödendi",
  PROCESSING: "Hazırlanıyor",
  SHIPPED: "Kargoda",
  DELIVERED: "Teslim",
  CANCELLED: "İptal",
};

const STATUS_COLOR: Record<string, string> = {
  PENDING: "bg-amber-100 text-amber-900",
  PAYMENT_RECEIVED: "bg-blue-100 text-blue-900",
  PROCESSING: "bg-violet-100 text-violet-900",
  SHIPPED: "bg-cyan-100 text-cyan-900",
  DELIVERED: "bg-emerald-100 text-emerald-900",
  CANCELLED: "bg-zinc-100 text-zinc-900",
};

interface OrderRow {
  orderNumber: string;
  status: string;
  totalAmountFormatted: string;
  customerName: string;
  customerEmail: string;
  itemCount: number;
  createdAtIso: string;
}

interface OrderBulkTableProps {
  orders: OrderRow[];
  exportHref: string;
}

export function OrderBulkTable({ orders, exportHref }: OrderBulkTableProps) {
  const router = useRouter();
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [bulkStatus, setBulkStatus] = useState<string>("");
  const [notify, setNotify] = useState(true);
  const [busy, setBusy] = useState(false);

  function toggle(orderNumber: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(orderNumber)) next.delete(orderNumber);
      else next.add(orderNumber);
      return next;
    });
  }
  function toggleAll() {
    if (selected.size === orders.length) setSelected(new Set());
    else setSelected(new Set(orders.map((o) => o.orderNumber)));
  }

  async function applyBulk() {
    if (!bulkStatus || selected.size === 0) return;
    if (!confirm(`${selected.size} siparişin durumu "${STATUS_LABEL[bulkStatus]}" olarak güncellenecek. Devam?`))
      return;
    setBusy(true);
    const res = await fetch("/api/admin/orders/bulk", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        orderNumbers: Array.from(selected),
        status: bulkStatus,
        notifyCustomers: notify,
      }),
    });
    setBusy(false);
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      toast.error(err.error ?? "Toplu güncelleme başarısız");
      return;
    }
    const data = (await res.json()) as { updated: number; notified: number };
    toast.success(
      `${data.updated} sipariş güncellendi · ${data.notified} müşteri e-postası gönderildi`,
    );
    setSelected(new Set());
    setBulkStatus("");
    router.refresh();
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-xs text-zinc-500">
          {selected.size > 0
            ? `${selected.size} sipariş seçildi`
            : `${orders.length} sipariş`}
        </p>
        <a
          href={exportHref}
          download
          className="inline-flex items-center gap-1.5 rounded-full border border-zinc-300 px-3 py-1.5 text-xs font-medium hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-800"
        >
          <Download className="h-3.5 w-3.5" /> CSV İndir
        </a>
      </div>

      {selected.size > 0 ? (
        <div className="flex flex-wrap items-center gap-3 rounded-xl border border-zinc-300 bg-zinc-50 px-4 py-2 dark:border-zinc-700 dark:bg-zinc-900">
          <select
            value={bulkStatus}
            onChange={(e) => setBulkStatus(e.target.value)}
            className="rounded-lg border border-zinc-300 bg-white px-3 py-1.5 text-xs dark:border-zinc-700 dark:bg-zinc-900"
            aria-label="Yeni durum"
          >
            <option value="">Yeni durum seç…</option>
            {Object.entries(STATUS_LABEL).map(([key, label]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </select>
          <label className="flex items-center gap-2 text-xs">
            <input
              type="checkbox"
              checked={notify}
              onChange={(e) => setNotify(e.target.checked)}
              className="h-3.5 w-3.5 accent-zinc-900"
            />
            Müşterilere e-posta gönder
          </label>
          <button
            onClick={applyBulk}
            disabled={busy || !bulkStatus}
            className="rounded-full bg-zinc-900 px-4 py-1.5 text-xs font-semibold text-white hover:bg-zinc-800 disabled:opacity-50 dark:bg-white dark:text-zinc-900"
          >
            {busy ? "Uygulanıyor…" : "Uygula"}
          </button>
          <button
            onClick={() => setSelected(new Set())}
            className="text-xs text-zinc-500 hover:text-zinc-900"
          >
            Seçimi temizle
          </button>
        </div>
      ) : null}

      <div className="rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
        {orders.length === 0 ? (
          <p className="p-5 text-sm text-zinc-500">
            Bu filtreye uygun sipariş yok.
          </p>
        ) : (
          <table className="w-full text-sm">
            <thead className="border-b border-zinc-200 text-left text-[10px] uppercase tracking-widest text-zinc-500 dark:border-zinc-800">
              <tr>
                <th className="w-10 px-4 py-2.5">
                  <input
                    type="checkbox"
                    checked={
                      selected.size > 0 && selected.size === orders.length
                    }
                    onChange={toggleAll}
                    className="h-4 w-4 accent-zinc-900"
                    aria-label="Tümünü seç"
                  />
                </th>
                <th className="px-4 py-2.5">Sipariş No</th>
                <th className="px-4 py-2.5">Müşteri</th>
                <th className="px-4 py-2.5">Adet</th>
                <th className="px-4 py-2.5">Tutar</th>
                <th className="px-4 py-2.5">Durum</th>
                <th className="px-4 py-2.5">Tarih</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
              {orders.map((o) => {
                const isSelected = selected.has(o.orderNumber);
                return (
                  <tr
                    key={o.orderNumber}
                    className={cn(
                      "hover:bg-zinc-50 dark:hover:bg-zinc-800",
                      isSelected && "bg-zinc-50 dark:bg-zinc-800",
                    )}
                  >
                    <td className="px-4 py-2">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggle(o.orderNumber)}
                        className="h-4 w-4 accent-zinc-900"
                        aria-label={`${o.orderNumber} seç`}
                      />
                    </td>
                    <td className="px-4 py-3">
                      <Link
                        href={`/admin/dashboard/orders/${o.orderNumber}`}
                        className="font-medium tabular-nums hover:underline"
                      >
                        {o.orderNumber}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-zinc-700 dark:text-zinc-300">
                      <div>{o.customerName}</div>
                      <div className="text-xs text-zinc-500">
                        {o.customerEmail}
                      </div>
                    </td>
                    <td className="px-4 py-3 tabular-nums">{o.itemCount}</td>
                    <td className="px-4 py-3 font-semibold tabular-nums">
                      {o.totalAmountFormatted}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-block rounded-full px-2 py-0.5 text-[10px] ${STATUS_COLOR[o.status] ?? "bg-zinc-100"}`}
                      >
                        {STATUS_LABEL[o.status] ?? o.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-zinc-500 tabular-nums">
                      {new Date(o.createdAtIso).toLocaleString("tr-TR", {
                        dateStyle: "short",
                        timeStyle: "short",
                      })}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
