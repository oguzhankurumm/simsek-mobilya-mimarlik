import Link from "next/link";
import { Plus, Upload } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { tlToKurus, formatPrice } from "@/lib/money";
import { ProductBulkTable } from "@/components/admin/product-bulk-table";

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
        <div className="flex gap-2">
          <Link
            href="/admin/dashboard/products/import"
            className="inline-flex items-center gap-1.5 rounded-full border border-zinc-300 px-4 py-2 text-xs font-medium hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-800"
          >
            <Upload className="h-3.5 w-3.5" /> CSV İçe Aktar
          </Link>
          <Link
            href="/admin/dashboard/products/new"
            className="inline-flex items-center gap-1.5 rounded-full bg-zinc-900 px-4 py-2 text-xs font-semibold text-white hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200"
          >
            <Plus className="h-3.5 w-3.5" /> Yeni Ürün
          </Link>
        </div>
      </header>

      <ProductBulkTable
        products={products.map((p) => ({
          id: p.id,
          name: p.name,
          slug: p.slug,
          categoryName: p.category.name,
          salePriceFormatted: formatPrice(tlToKurus(p.salePrice.toString())),
          stock: p.stock,
          active: p.active,
          featured: p.featured,
          imageUrl: p.images[0]?.url ?? null,
        }))}
      />
    </div>
  );
}
