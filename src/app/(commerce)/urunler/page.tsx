import type { Metadata } from "next";
import { getProducts, IS_DEMO_MODE } from "@/lib/products";
import { ProductCard } from "@/components/commerce/product-card";

export const metadata: Metadata = {
  title: "Ürünler — Şimşek Mobilya",
  description:
    "Atölyemizden seçilmiş özel tasarım mobilya koleksiyonu. KDV dahil fiyatlarla.",
};

// Server Component — fetches from Prisma, falls back to MOCK_PRODUCTS when
// DATABASE_URL is unset. Static during build, ISR thereafter (revalidate
// every 60 seconds so admin updates show up reasonably fast).

export const revalidate = 60;

export default async function ProductsPage() {
  const products = await getProducts();

  return (
    <section className="container-editorial py-10 md:py-16">
      <header className="mb-8 flex flex-col gap-3 md:mb-12">
        <p className="text-[10px] font-mono uppercase tracking-widest text-ink-faint">
          Koleksiyon
        </p>
        <h1 className="text-display text-4xl tracking-tight md:text-5xl">
          Ürünler
        </h1>
        <p className="max-w-2xl text-sm text-ink-muted md:text-base">
          Atölyemizden seçilmiş, ölçüye uyarlanabilir mobilyalar. Tüm
          fiyatlara KDV dahildir.
        </p>
        {IS_DEMO_MODE ? (
          <div className="mt-2 rounded-md border border-amber-300 bg-amber-50 px-3 py-2 text-xs text-amber-900 dark:border-amber-700 dark:bg-amber-950 dark:text-amber-200">
            Demo katalog — gerçek veri için <code>DATABASE_URL</code> bağla,{" "}
            <code>npm run db:migrate</code> ve <code>npm run db:seed</code>{" "}
            çalıştır.
          </div>
        ) : null}
      </header>

      {products.length === 0 ? (
        <div className="py-20 text-center text-sm text-ink-muted">
          Henüz ürün eklenmedi.
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3 md:gap-x-6 lg:grid-cols-4">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </section>
  );
}
