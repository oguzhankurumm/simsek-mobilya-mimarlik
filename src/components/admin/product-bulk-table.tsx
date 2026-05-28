"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface ProductRow {
  id: string;
  name: string;
  slug: string;
  categoryName: string;
  salePriceFormatted: string;
  stock: number;
  active: boolean;
  featured: boolean;
  imageUrl: string | null;
}

interface ProductBulkTableProps {
  products: ProductRow[];
}

// Replaces the read-only table on /admin/dashboard/products. Adds a checkbox
// column + a bulk-action toolbar that appears when at least one row is
// selected. Avoids react-table — for ≤200 products this hand-rolled is
// faster + zero deps.

export function ProductBulkTable({ products }: ProductBulkTableProps) {
  const router = useRouter();
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [busy, setBusy] = useState(false);

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }
  function toggleAll() {
    if (selected.size === products.length) setSelected(new Set());
    else setSelected(new Set(products.map((p) => p.id)));
  }

  async function runAction(
    action:
      | "delete"
      | "activate"
      | "deactivate"
      | "feature"
      | "unfeature",
  ) {
    if (selected.size === 0) return;
    if (action === "delete") {
      if (!confirm(`${selected.size} ürün silinsin mi?`)) return;
    }
    setBusy(true);
    const res = await fetch("/api/admin/products/bulk", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, productIds: Array.from(selected) }),
    });
    setBusy(false);
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      toast.error(err.error ?? "Toplu işlem başarısız");
      return;
    }
    toast.success(
      action === "delete"
        ? `${selected.size} ürün silindi`
        : `${selected.size} ürün güncellendi`,
    );
    setSelected(new Set());
    router.refresh();
  }

  return (
    <div className="space-y-3">
      {selected.size > 0 ? (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-zinc-300 bg-zinc-50 px-4 py-2 dark:border-zinc-700 dark:bg-zinc-900">
          <p className="text-sm font-medium tabular-nums">
            {selected.size} seçildi
          </p>
          <div className="flex flex-wrap gap-1.5 text-xs">
            <button
              onClick={() => runAction("activate")}
              disabled={busy}
              className="rounded-full border border-zinc-300 px-3 py-1.5 hover:bg-white dark:border-zinc-700 dark:hover:bg-zinc-800"
            >
              Aktifleştir
            </button>
            <button
              onClick={() => runAction("deactivate")}
              disabled={busy}
              className="rounded-full border border-zinc-300 px-3 py-1.5 hover:bg-white dark:border-zinc-700 dark:hover:bg-zinc-800"
            >
              Pasifleştir
            </button>
            <button
              onClick={() => runAction("feature")}
              disabled={busy}
              className="rounded-full border border-zinc-300 px-3 py-1.5 hover:bg-white dark:border-zinc-700 dark:hover:bg-zinc-800"
            >
              Öne çıkar
            </button>
            <button
              onClick={() => runAction("unfeature")}
              disabled={busy}
              className="rounded-full border border-zinc-300 px-3 py-1.5 hover:bg-white dark:border-zinc-700 dark:hover:bg-zinc-800"
            >
              Öneriden kaldır
            </button>
            <button
              onClick={() => runAction("delete")}
              disabled={busy}
              className="rounded-full border border-red-300 bg-red-50 px-3 py-1.5 text-red-700 hover:bg-red-100 dark:border-red-800 dark:bg-red-950 dark:text-red-300"
            >
              Sil
            </button>
            <button
              onClick={() => setSelected(new Set())}
              className="rounded-full px-3 py-1.5 text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200"
            >
              Seçimi temizle
            </button>
          </div>
        </div>
      ) : null}

      <div className="rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
        {products.length === 0 ? (
          <p className="p-5 text-sm text-zinc-500">Henüz ürün eklenmedi.</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="border-b border-zinc-200 text-left text-[10px] uppercase tracking-widest text-zinc-500 dark:border-zinc-800">
              <tr>
                <th className="px-4 py-2.5 w-10">
                  <input
                    type="checkbox"
                    checked={
                      selected.size > 0 && selected.size === products.length
                    }
                    onChange={toggleAll}
                    className="h-4 w-4 accent-zinc-900"
                    aria-label="Tümünü seç"
                  />
                </th>
                <th className="px-4 py-2.5">Görsel</th>
                <th className="px-4 py-2.5">Ad</th>
                <th className="px-4 py-2.5">Kategori</th>
                <th className="px-4 py-2.5">Fiyat</th>
                <th className="px-4 py-2.5">Stok</th>
                <th className="px-4 py-2.5">Durum</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
              {products.map((p) => {
                const isSelected = selected.has(p.id);
                return (
                  <tr
                    key={p.id}
                    className={cn(
                      "hover:bg-zinc-50 dark:hover:bg-zinc-800",
                      isSelected && "bg-zinc-50 dark:bg-zinc-800",
                    )}
                  >
                    <td className="px-4 py-2">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggle(p.id)}
                        className="h-4 w-4 accent-zinc-900"
                        aria-label={`${p.name} seç`}
                      />
                    </td>
                    <td className="px-4 py-2">
                      {p.imageUrl ? (
                        <div className="relative h-10 w-10 overflow-hidden rounded border border-zinc-200">
                          <Image
                            src={p.imageUrl}
                            alt=""
                            fill
                            sizes="40px"
                            className="object-cover"
                          />
                        </div>
                      ) : (
                        <div className="h-10 w-10 rounded border border-dashed border-zinc-300 bg-zinc-100" />
                      )}
                    </td>
                    <td className="px-4 py-2">
                      <Link
                        href={`/admin/dashboard/products/${p.id}`}
                        className="font-medium hover:underline"
                      >
                        {p.name}
                        {p.featured ? (
                          <span className="ml-1 inline-block rounded-full bg-amber-100 px-1.5 py-0.5 text-[9px] uppercase text-amber-900">
                            ★
                          </span>
                        ) : null}
                      </Link>
                      <p className="text-xs text-zinc-500">{p.slug}</p>
                    </td>
                    <td className="px-4 py-2 text-zinc-700 dark:text-zinc-300">
                      {p.categoryName}
                    </td>
                    <td className="px-4 py-2 font-semibold tabular-nums">
                      {p.salePriceFormatted}
                    </td>
                    <td className="px-4 py-2 tabular-nums">{p.stock}</td>
                    <td className="px-4 py-2">
                      <span
                        className={`inline-block rounded-full px-2 py-0.5 text-[10px] ${
                          p.active
                            ? "bg-emerald-100 text-emerald-900"
                            : "bg-zinc-100 text-zinc-900"
                        }`}
                      >
                        {p.active ? "Aktif" : "Pasif"}
                      </span>
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
