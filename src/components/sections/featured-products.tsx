import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { getProducts } from "@/lib/products";
import { formatPrice } from "@/lib/money";
import { Eyebrow } from "@/components/atoms/eyebrow";
import { Reveal } from "@/components/atoms/reveal";

// Home-page commerce bridge. Renders up to 4 featured products in the same
// editorial language as featured-projects (cover-led card, eyebrow meta).
// No red CTAs, no discount badges — just "İncele". Sepete Ekle lives on
// /urunler and PDP, per the Phase 2 review T07 visual-reduction note.

interface FeaturedProductsProps {
  locale: "tr" | "en";
}

export async function FeaturedProducts({ locale }: FeaturedProductsProps) {
  const products = await getProducts({ featured: true, limit: 4 });
  if (products.length === 0) return null;

  const labels =
    locale === "tr"
      ? {
          eyebrow: "ATÖLYEDEN",
          title: "Öne Çıkan Ürünler",
          subtitle:
            "Hazır stoktaki seçili parçalar. Tüm fiyatlar KDV dahildir.",
          viewAll: "Koleksiyonun tamamını gör",
          inspect: "İncele",
        }
      : {
          eyebrow: "FROM THE ATELIER",
          title: "Featured Pieces",
          subtitle:
            "Selected pieces from our ready stock. All prices include VAT.",
          viewAll: "View full collection",
          inspect: "Details",
        };

  return (
    <section className="bg-background">
      <div className="container-editorial section-y">
        <div className="mb-10 flex flex-col gap-6 md:mb-12 md:flex-row md:items-end md:justify-between">
          <Reveal>
            <Eyebrow>{labels.eyebrow}</Eyebrow>
            <h2 className="mt-3 text-display text-[clamp(2rem,4.6vw,3.5rem)] leading-tight tracking-tight">
              {labels.title}
            </h2>
            <p className="mt-3 max-w-prose text-sm text-ink-muted md:text-base">
              {labels.subtitle}
            </p>
          </Reveal>
          <Link
            href="/urunler"
            className="group inline-flex items-center gap-1.5 text-sm font-medium text-ink hover:text-brand"
          >
            {labels.viewAll}
            <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-4 md:gap-x-6">
          {products.map((product) => {
            const image =
              product.images[0]?.url ?? "/placeholder-product.svg";
            return (
              <Reveal key={product.id}>
                <Link
                  href={`/urunler/${product.slug}`}
                  className="group block space-y-3"
                >
                  <div className="relative aspect-[4/5] overflow-hidden rounded-md bg-surface-2">
                    <Image
                      src={image}
                      alt={product.images[0]?.altText ?? product.name}
                      fill
                      sizes="(min-width: 1024px) 25vw, 50vw"
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-mono uppercase tracking-widest text-ink-faint">
                      {product.categoryName}
                    </p>
                    <h3 className="text-base font-medium leading-snug tracking-tight">
                      {product.name}
                    </h3>
                    <p className="pt-0.5 text-sm font-semibold tabular-nums">
                      {formatPrice(product.salePriceKurus)}
                    </p>
                  </div>
                </Link>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
