import type { Metadata } from "next";
import {
  getCategoriesWithCounts,
  getProductsResult,
  type ProductSort,
} from "@/lib/products";
import { ProductCard } from "@/components/commerce/product-card";
import { ProductSearchBar } from "@/components/commerce/product-search-bar";
import { ProductFilterBar } from "@/components/commerce/product-filter-bar";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "Ürünler — Şimşek Mobilya",
  description:
    "Atölyemizden seçilmiş özel tasarım mobilya koleksiyonu. KDV dahil fiyatlarla.",
};

interface PageProps {
  searchParams: Promise<{
    kategori?: string;
    sirala?: string;
    q?: string;
  }>;
}

// Dynamic so search/filter/sort URL params are honoured on every request.
// 10s `s-maxage` cache keeps repeat queries cheap behind Vercel's CDN.
export const revalidate = 10;

function normalizeSort(value: string | undefined): ProductSort {
  switch (value) {
    case "fiyat-artan":
    case "fiyat-azalan":
    case "yeni":
    case "oneri":
      return value;
    default:
      return "oneri";
  }
}

export default async function ProductsPage({ searchParams }: PageProps) {
  const { kategori, sirala, q } = await searchParams;
  const sort = normalizeSort(sirala);

  const [productsResult, categories] = await Promise.all([
    getProductsResult({
      categorySlug: kategori || undefined,
      search: q || undefined,
      sort,
    }),
    getCategoriesWithCounts(),
  ]);
  const { products, isDemo } = productsResult;

  const isFiltered = Boolean(kategori || q);

  return (
    <section className="container-editorial py-8 md:py-14">
      <header className="mb-6 flex flex-col gap-4 md:mb-10">
        <div>
          <p className="text-[10px] font-mono uppercase tracking-widest text-ink-faint">
            Koleksiyon
          </p>
          <h1 className="text-display text-4xl tracking-tight md:text-5xl">
            Ürünler
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-ink-muted md:text-base">
            Atölyemizden seçilmiş, ölçüye uyarlanabilir mobilyalar. Tüm
            fiyatlara KDV dahildir.
          </p>
        </div>

        <Suspense fallback={null}>
          <ProductSearchBar />
        </Suspense>

        <Suspense fallback={null}>
          <ProductFilterBar categories={categories} />
        </Suspense>

        {isDemo ? (
          <div className="rounded-md border border-amber-300 bg-amber-50 px-3 py-2 text-xs text-amber-900 dark:border-amber-700 dark:bg-amber-950 dark:text-amber-200">
            Demo katalog — gerçek veri için <code>DATABASE_URL</code> bağla,{" "}
            <code>npm run db:migrate</code> ve <code>npm run db:seed</code>{" "}
            çalıştır.
          </div>
        ) : null}
      </header>

      {products.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border py-16 text-center text-sm text-ink-muted">
          <p className="mb-2 font-semibold text-ink">
            Eşleşen ürün bulunamadı
          </p>
          <p>
            {isFiltered
              ? "Arama veya filtre ile eşleşen ürün yok. Filtreleri sıfırlayın."
              : "Henüz ürün eklenmedi."}
          </p>
        </div>
      ) : (
        <>
          <p className="mb-4 text-xs text-ink-faint">
            {products.length} ürün
          </p>
          <div className="grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3 md:gap-x-6 lg:grid-cols-4">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </>
      )}
    </section>
  );
}
