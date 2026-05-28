"use client";

import { useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

interface GalleryImage {
  url: string;
  altText: string;
}

interface PdpGalleryProps {
  images: GalleryImage[];
  productName: string;
  lowStockBadge?: number | null;
}

// Lightweight PDP gallery. Selected image up top, horizontal thumbnail strip
// below. No carousel library — for ≤6 images this is faster + scrolls more
// predictably than embla. Active thumbnail gets a brand-tinted border.

export function PdpGallery({
  images,
  productName,
  lowStockBadge,
}: PdpGalleryProps) {
  const safeImages =
    images.length > 0
      ? images
      : [{ url: "/placeholder-product.svg", altText: productName }];

  const [activeIndex, setActiveIndex] = useState(0);
  const active = safeImages[activeIndex] ?? safeImages[0];

  return (
    <div className="space-y-3">
      <div className="relative aspect-[4/5] overflow-hidden rounded-md bg-surface-2">
        <Image
          src={active.url}
          alt={active.altText || productName}
          fill
          sizes="(min-width: 768px) 50vw, 100vw"
          priority
          className="object-cover"
        />
        {lowStockBadge != null && lowStockBadge > 0 && lowStockBadge <= 2 ? (
          <span className="absolute right-3 top-3 rounded-full bg-background/90 px-3 py-1 text-[10px] font-medium uppercase tracking-wide text-brand backdrop-blur">
            Son {lowStockBadge} Adet
          </span>
        ) : null}
      </div>

      {safeImages.length > 1 ? (
        <ul
          className="flex gap-2 overflow-x-auto pb-1"
          role="listbox"
          aria-label="Ürün görselleri"
        >
          {safeImages.map((img, i) => (
            <li key={img.url + i} className="shrink-0">
              <button
                onClick={() => setActiveIndex(i)}
                role="option"
                aria-selected={i === activeIndex}
                aria-label={`Görsel ${i + 1}`}
                className={cn(
                  "relative h-16 w-16 overflow-hidden rounded border-2 bg-surface-2 transition-colors md:h-20 md:w-20",
                  i === activeIndex
                    ? "border-brand"
                    : "border-border hover:border-ink/40",
                )}
              >
                <Image
                  src={img.url}
                  alt=""
                  fill
                  sizes="80px"
                  className="object-cover"
                />
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
