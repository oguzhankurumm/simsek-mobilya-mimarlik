"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import useEmblaCarousel from "embla-carousel-react";
import { ChevronLeft, ChevronRight, Maximize2, X } from "lucide-react";
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
  const [lightboxOpen, setLightboxOpen] = useState(false);

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
        <button
          type="button"
          onClick={() => setLightboxOpen(true)}
          className="group relative block aspect-[4/5] w-full overflow-hidden rounded-md bg-surface-2"
          aria-label="Görseli büyüt"
        >
          <Image
            src={only.url}
            alt={only.altText || productName}
            fill
            sizes="(min-width: 768px) 50vw, 100vw"
            priority
            className="object-cover transition-transform duration-300 group-hover:scale-[1.02]"
          />
          {showLowStock ? <LowStockBadge stock={lowStockBadge!} /> : null}
          <ExpandHint />
        </button>
        <Lightbox
          open={lightboxOpen}
          onClose={() => setLightboxOpen(false)}
          images={safeImages}
          initialIndex={0}
          productName={productName}
        />
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="relative overflow-hidden rounded-md bg-surface-2">
        <div className="overflow-hidden" ref={emblaRef}>
          <div className="flex">
            {safeImages.map((img, i) => (
              <button
                key={img.url + i}
                type="button"
                onClick={() => setLightboxOpen(true)}
                className="relative aspect-[4/5] w-full shrink-0"
                aria-roledescription="slide"
                aria-label={`Görseli ${i + 1} büyüt`}
              >
                <Image
                  src={img.url}
                  alt={img.altText || `${productName} — ${i + 1}`}
                  fill
                  sizes="(min-width: 768px) 50vw, 100vw"
                  priority={i === 0}
                  className="object-cover"
                />
              </button>
            ))}
          </div>
        </div>

        {showLowStock ? <LowStockBadge stock={lowStockBadge!} /> : null}
        <ExpandHint />

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

      <Lightbox
        open={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
        images={safeImages}
        initialIndex={selectedIndex}
        productName={productName}
      />
    </div>
  );
}

function LowStockBadge({ stock }: { stock: number }) {
  return (
    <span className="pointer-events-none absolute right-3 top-3 z-10 rounded-full bg-background/90 px-3 py-1 text-[10px] font-medium uppercase tracking-wide text-brand backdrop-blur">
      Son {stock} Adet
    </span>
  );
}

function ExpandHint() {
  return (
    <span
      aria-hidden
      className="pointer-events-none absolute left-3 top-3 z-10 hidden h-8 w-8 items-center justify-center rounded-full bg-background/80 text-ink-muted backdrop-blur transition-opacity group-hover:bg-background md:flex"
    >
      <Maximize2 className="h-3.5 w-3.5" />
    </span>
  );
}

interface LightboxProps {
  open: boolean;
  onClose: () => void;
  images: GalleryImage[];
  initialIndex: number;
  productName: string;
}

function Lightbox({
  open,
  onClose,
  images,
  initialIndex,
  productName,
}: LightboxProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: images.length > 1,
    startIndex: initialIndex,
  });
  const [index, setIndex] = useState(initialIndex);

  // Sync initial index on every open (otherwise lightbox starts where user
  // last left it, which is jarring).
  useEffect(() => {
    if (!emblaApi || !open) return;
    emblaApi.scrollTo(initialIndex, true);
  }, [open, initialIndex, emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    const onSelect = () => setIndex(emblaApi.selectedScrollSnap());
    onSelect();
    emblaApi.on("select", onSelect);
    return () => {
      emblaApi.off("select", onSelect);
    };
  }, [emblaApi]);

  // Body scroll lock + Escape to close while open.
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") emblaApi?.scrollPrev();
      if (e.key === "ArrowRight") emblaApi?.scrollNext();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose, emblaApi]);

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`${productName} görseller`}
      className="fixed inset-0 z-[100] flex flex-col bg-black/95"
    >
      <header className="flex items-center justify-between gap-3 px-4 py-3 text-white">
        <p className="text-xs tabular-nums">
          {index + 1} / {images.length}
        </p>
        <button
          onClick={onClose}
          aria-label="Kapat"
          className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 hover:bg-white/20"
        >
          <X className="h-4 w-4" />
        </button>
      </header>

      <div className="flex flex-1 items-center" ref={emblaRef}>
        <div className="flex h-full w-full">
          {images.map((img, i) => (
            <div
              key={img.url + i}
              className="relative flex h-full w-full shrink-0 items-center justify-center"
            >
              <Image
                src={img.url}
                alt={img.altText || `${productName} — ${i + 1}`}
                fill
                sizes="100vw"
                priority={i === initialIndex}
                className="object-contain"
              />
            </div>
          ))}
        </div>
      </div>

      {images.length > 1 ? (
        <div className="flex items-center justify-between gap-4 px-4 py-3">
          <button
            onClick={() => emblaApi?.scrollPrev()}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20"
            aria-label="Önceki"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <div className="flex gap-1.5">
            {images.map((_, i) => (
              <span
                key={i}
                className={cn(
                  "h-1.5 rounded-full transition-all",
                  i === index ? "w-6 bg-white" : "w-1.5 bg-white/40",
                )}
                aria-hidden
              />
            ))}
          </div>
          <button
            onClick={() => emblaApi?.scrollNext()}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20"
            aria-label="Sonraki"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      ) : null}
    </div>
  );
}
