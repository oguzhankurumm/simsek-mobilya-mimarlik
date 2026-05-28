import Link from "next/link";
import Image from "next/image";
import { formatPrice } from "@/lib/money";
import type { PublicProduct } from "@/lib/products";
import { cn } from "@/lib/utils";

// Product card — atelier-leaning, NOT Vivense-style. No red ribbons, no
// "% indirim" badges by default. Discount shown as a struck-through old price
// only when discountPercent > 0. (Phase 2 review: T07 commerce visual
// reduction.) Out-of-stock state is muted, not aggressive.

interface ProductCardProps {
  product: PublicProduct;
  variant?: "default" | "compact";
}

export function ProductCard({
  product,
  variant = "default",
}: ProductCardProps) {
  const mainImage = product.images[0]?.url ?? "/placeholder-product.svg";
  const isOutOfStock = product.stock <= 0;
  const isLowStock = product.stock > 0 && product.stock <= 2;

  return (
    <Link
      href={`/urunler/${product.slug}`}
      className={cn(
        "group block",
        variant === "compact" ? "" : "space-y-3",
      )}
    >
      <div className="relative aspect-[4/5] overflow-hidden rounded-md bg-surface-2">
        <Image
          src={mainImage}
          alt={product.images[0]?.altText ?? product.name}
          fill
          sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
          className={cn(
            "object-cover transition-transform duration-500 group-hover:scale-105",
            isOutOfStock && "opacity-60 grayscale",
          )}
        />
        {isOutOfStock ? (
          <span className="absolute right-2 top-2 rounded-full bg-background/90 px-3 py-1 text-[10px] font-medium uppercase tracking-wide text-ink-muted backdrop-blur">
            Stokta Yok
          </span>
        ) : isLowStock ? (
          <span className="absolute right-2 top-2 rounded-full bg-background/90 px-3 py-1 text-[10px] font-medium uppercase tracking-wide text-brand backdrop-blur">
            Son {product.stock} Adet
          </span>
        ) : null}
      </div>

      <div className="space-y-1">
        <p className="text-[10px] font-mono uppercase tracking-widest text-ink-faint">
          {product.categoryName}
        </p>
        <h3 className="text-base font-medium leading-snug tracking-tight">
          {product.name}
        </h3>
        {variant === "default" && product.widthCm ? (
          <p className="text-xs text-ink-muted tabular-nums">
            {product.widthCm} × {product.depthCm} × {product.heightCm} cm
          </p>
        ) : null}
        <div className="flex items-baseline gap-2 pt-1">
          <span className="text-base font-semibold tabular-nums">
            {formatPrice(product.salePriceKurus)}
          </span>
          {product.discountPercent > 0 ? (
            <span className="text-xs text-ink-faint line-through tabular-nums">
              {formatPrice(product.originalPriceKurus)}
            </span>
          ) : null}
        </div>
      </div>
    </Link>
  );
}
