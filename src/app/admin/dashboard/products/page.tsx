import Link from "next/link";
import Image from "next/image";
import { Plus } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { tlToKurus, formatPrice } from "@/lib/money";

export const dynamic = "force-dynamic";

export default async function AdminProductsPage() {
  const products = await prisma.product
    .findMany({
      include: {
        category: true,
        images: { where: { isMain: true }, take: 1 },
      },
      orderBy: { createdAt: "desc" },
      take: 200,
    })
    .catch(() => []);

  return (
    <div className="space-y-6">
      <header className="flex items-end justify-between gap-3">
        <div>
          <p className="text-[10px] font-mono uppercase tracking-widest text-zinc-500">
            Katalog
          </p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight">Ürünler</h1>
        </div>
        <Link
          href="/admin/dashboard/products/new"
          className="inline-flex items-center gap-1.5 rounded-full bg-zinc-900 px-4 py-2 text-xs font-semibold text-white hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200"
        >
          <Plus className="h-3.5 w-3.5" /> Yeni Ürün
        </Link>
      </header>

      <div className="rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
        {products.length === 0 ? (
          <p className="p-5 text-sm text-zinc-500">Henüz ürün eklenmedi.</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="border-b border-zinc-200 text-left text-[10px] uppercase tracking-widest text-zinc-500 dark:border-zinc-800">
              <tr>
                <th className="px-4 py-2.5">Görsel</th>
                <th className="px-4 py-2.5">Ad</th>
                <th className="px-4 py-2.5">Kategori</th>
                <th className="px-4 py-2.5">Fiyat</th>
                <th className="px-4 py-2.5">Stok</th>
                <th className="px-4 py-2.5">Durum</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
              {products.map((p) => (
                <tr key={p.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800">
                  <td className="px-4 py-2">
                    {p.images[0]?.url ? (
                      <div className="relative h-10 w-10 overflow-hidden rounded border border-zinc-200">
                        <Image
                          src={p.images[0].url}
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
                    </Link>
                    <p className="text-xs text-zinc-500">{p.slug}</p>
                  </td>
                  <td className="px-4 py-2 text-zinc-700 dark:text-zinc-300">
                    {p.category.name}
                  </td>
                  <td className="px-4 py-2 font-semibold tabular-nums">
                    {formatPrice(tlToKurus(p.salePrice.toString()))}
                  </td>
                  <td className="px-4 py-2 tabular-nums">
                    {p.stock}
                  </td>
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
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
