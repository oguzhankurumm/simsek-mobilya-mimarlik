import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { getProductBySlug, getProducts, IS_DEMO_MODE } from "@/lib/products";
import { formatPrice } from "@/lib/money";
import { AddToCartButton } from "@/components/commerce/add-to-cart-button";
import { WhatsappInquiryButton } from "@/components/commerce/whatsapp-inquiry-button";
import { ProductCard } from "@/components/commerce/product-card";
import { PdpGallery } from "@/components/commerce/pdp-gallery";

export const revalidate = 60;

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return { title: "Ürün bulunamadı" };
  return {
    title: `${product.name} — Şimşek Mobilya`,
    description: product.description.slice(0, 160),
    openGraph: {
      title: product.name,
      description: product.description.slice(0, 160),
      images: product.images[0] ? [{ url: product.images[0].url }] : [],
    },
  };
}

export default async function ProductDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  // Related products from same category (excluding current).
  const allCategoryProducts = await getProducts({
    categorySlug: product.categorySlug,
    limit: 5,
  });
  const related = allCategoryProducts.filter((p) => p.id !== product.id).slice(0, 4);

  const dimensionsLabel =
    product.widthCm && product.depthCm && product.heightCm
      ? `${product.widthCm} × ${product.depthCm} × ${product.heightCm} cm (G × D × Y)`
      : null;

  return (
    <section className="container-editorial py-6 md:py-12">
      {IS_DEMO_MODE ? (
        <div className="mb-4 rounded-md border border-amber-300 bg-amber-50 px-3 py-2 text-xs text-amber-900 dark:border-amber-700 dark:bg-amber-950 dark:text-amber-200">
          Demo veri — gerçek katalog için DB bağlayın ve seed çalıştırın.
        </div>
      ) : null}

      <Link
        href="/urunler"
        className="mb-6 inline-flex items-center gap-1 text-xs text-ink-muted hover:text-brand"
      >
        <ChevronLeft className="h-3.5 w-3.5" /> Tüm Ürünler
      </Link>

      <div className="grid grid-cols-1 gap-8 md:grid-cols-2 md:gap-12">
        <PdpGallery
          images={product.images}
          productName={product.name}
          lowStockBadge={product.stock}
        />

        <div className="flex flex-col gap-5">
          <p className="text-[10px] font-mono uppercase tracking-widest text-ink-faint">
            {product.categoryName}
          </p>
          <h1 className="text-display text-3xl tracking-tight md:text-4xl">
            {product.name}
          </h1>

          <div className="flex items-baseline gap-3">
            <span className="text-3xl font-semibold tabular-nums">
              {formatPrice(product.salePriceKurus)}
            </span>
            {product.discountPercent > 0 ? (
              <span className="text-base text-ink-faint line-through tabular-nums">
                {formatPrice(product.originalPriceKurus)}
              </span>
            ) : null}
          </div>
          <p className="text-xs text-ink-muted">
            KDV dahil. Kargo bedeli sepet sonrası hesaplanır.
          </p>

          {product.description ? (
            <p className="mt-2 text-sm leading-relaxed text-ink md:text-base">
              {product.description}
            </p>
          ) : null}

          <dl className="grid grid-cols-1 gap-y-3 border-y border-border py-5 text-sm md:grid-cols-2">
            {dimensionsLabel ? (
              <div>
                <dt className="text-[10px] font-mono uppercase tracking-widest text-ink-faint">
                  Ölçü
                </dt>
                <dd className="mt-1 tabular-nums">{dimensionsLabel}</dd>
              </div>
            ) : null}
            {product.material.length > 0 ? (
              <div>
                <dt className="text-[10px] font-mono uppercase tracking-widest text-ink-faint">
                  Malzeme
                </dt>
                <dd className="mt-1 capitalize">
                  {product.material.join(", ")}
                </dd>
              </div>
            ) : null}
            {product.color.length > 0 ? (
              <div>
                <dt className="text-[10px] font-mono uppercase tracking-widest text-ink-faint">
                  Renk
                </dt>
                <dd className="mt-1 capitalize">
                  {product.color.join(", ")}
                </dd>
              </div>
            ) : null}
            {product.room ? (
              <div>
                <dt className="text-[10px] font-mono uppercase tracking-widest text-ink-faint">
                  Mekan
                </dt>
                <dd className="mt-1 capitalize">{product.room}</dd>
              </div>
            ) : null}
          </dl>

          {/* Sticky CTA wrapper — on mobile, this row sticks to bottom above
              the bottom tabs (env safe-area). On desktop, inline. */}
          <div className="flex flex-col gap-3 md:flex-row md:items-center">
            <AddToCartButton
              product={{
                id: product.id,
                name: product.name,
                slug: product.slug,
                originalPriceKurus: product.originalPriceKurus,
                salePriceKurus: product.salePriceKurus,
                image: product.images[0]?.url ?? "/placeholder-product.svg",
                brand: product.brand,
                stock: product.stock,
                categorySlug: product.categorySlug,
              }}
              className="flex-1 md:flex-none md:px-10"
            />
            <WhatsappInquiryButton
              productName={product.name}
              productSlug={product.slug}
              className="flex-1 md:flex-none"
              variant="secondary"
            />
          </div>

          {product.stock <= 0 ? (
            <p className="mt-1 text-xs text-ink-muted">
              Bu ürün şu an stokta değil. Üretim/temin süresi için WhatsApp
              üzerinden iletişime geçebilirsiniz.
            </p>
          ) : null}
        </div>
      </div>

      {related.length > 0 ? (
        <section className="mt-20">
          <h2 className="mb-6 text-xs font-mono uppercase tracking-widest text-ink-faint">
            Aynı Mekandan
          </h2>
          <div className="grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3 lg:grid-cols-4">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} variant="compact" />
            ))}
          </div>
        </section>
      ) : null}
    </section>
  );
}
