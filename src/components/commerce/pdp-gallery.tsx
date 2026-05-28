"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import useEmblaCarousel from "embla-carousel-react";
import { ChevronLeft, ChevronRight } from "lucide-react";
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

// PDP image gallery built on embla-carousel — already in deps, gives free
// swipe support + snap behaviour on mobile + keyboard arrow nav. For ≤1
// image we don't even instantiate embla (no carousel needed).

export function PdpGallery({
  images,
  productName,
  lowStockBadge,
}: PdpGalleryProps) {
  const safeImages =
    images.length > 0
      ? images
      : [{ url: "/placeholder-product.svg", altText: productName }];

  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: false,
    align: "start",
    skipSnaps: false,
  });
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(false);

  const scrollTo = useCallback(
    (index: number) => emblaApi?.scrollTo(index),
    [emblaApi],
  );
  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    const onSelect = () => {
      setSelectedIndex(emblaApi.selectedScrollSnap());
      setCanPrev(emblaApi.canScrollPrev());
      setCanNext(emblaApi.canScrollNext());
    };
    onSelect();
    emblaApi.on("select", onSelect);
    emblaApi.on("reInit", onSelect);
    return () => {
      emblaApi.off("select", onSelect);
      emblaApi.off("reInit", onSelect);
    };
  }, [emblaApi]);

  const showLowStock =
    lowStockBadge != null && lowStockBadge > 0 && lowStockBadge <= 2;

  if (safeImages.length === 1) {
    const only = safeImages[0];
    return (
      <div className="space-y-3">
        <div className="relative aspect-[4/5] overflow-hidden rounded-md bg-surface-2">
          <Image
            src={only.url}
            alt={only.altText || productName}
            fill
            sizes="(min-width: 768px) 50vw, 100vw"
            priority
            className="object-cover"
          />
          {showLowStock ? (
            <LowStockBadge stock={lowStockBadge!} />
          ) : null}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="relative overflow-hidden rounded-md bg-surface-2">
        <div className="overflow-hidden" ref={emblaRef}>
          <div className="flex">
            {safeImages.map((img, i) => (
              <div
                key={img.url + i}
                className="relative aspect-[4/5] w-full shrink-0"
                aria-roledescription="slide"
              >
                <Image
                  src={img.url}
                  alt={img.altText || `${productName} — ${i + 1}`}
                  fill
                  sizes="(min-width: 768px) 50vw, 100vw"
                  priority={i === 0}
                  className="object-cover"
                />
              </div>
            ))}
          </div>
        </div>

        {showLowStock ? <LowStockBadge stock={lowStockBadge!} /> : null}

        <button
          onClick={scrollPrev}
          disabled={!canPrev}
          aria-label="Önceki görsel"
          className="absolute left-3 top-1/2 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-background/90 text-ink shadow backdrop-blur transition-opacity hover:bg-background disabled:opacity-30 md:flex"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <button
          onClick={scrollNext}
          disabled={!canNext}
          aria-label="Sonraki görsel"
          className="absolute right-3 top-1/2 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-background/90 text-ink shadow backdrop-blur transition-opacity hover:bg-background disabled:opacity-30 md:flex"
        >
          <ChevronRight className="h-4 w-4" />
        </button>

        <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5 md:hidden">
          {safeImages.map((_, i) => (
            <span
              key={i}
              className={cn(
                "h-1.5 w-1.5 rounded-full transition-all",
                i === selectedIndex ? "w-4 bg-ink" : "bg-ink/40",
              )}
              aria-hidden
            />
          ))}
        </div>
      </div>

      <ul
        className="flex gap-2 overflow-x-auto pb-1"
        role="listbox"
        aria-label="Ürün görselleri"
      >
        {safeImages.map((img, i) => (
          <li key={img.url + i} className="shrink-0">
            <button
              onClick={() => scrollTo(i)}
              role="option"
              aria-selected={i === selectedIndex}
              aria-label={`Görsel ${i + 1}`}
              className={cn(
                "relative h-16 w-16 overflow-hidden rounded border-2 bg-surface-2 transition-colors md:h-20 md:w-20",
                i === selectedIndex
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
    </div>
  );
}

function LowStockBadge({ stock }: { stock: number }) {
  return (
    <span className="absolute right-3 top-3 z-10 rounded-full bg-background/90 px-3 py-1 text-[10px] font-medium uppercase tracking-wide text-brand backdrop-blur">
      Son {stock} Adet
    </span>
  );
}
