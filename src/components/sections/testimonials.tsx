"use client";

import { useState, useEffect, useCallback } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { ChevronLeft, ChevronRight, Quote } from "lucide-react";
import { useTranslations } from "next-intl";
import { Eyebrow } from "@/components/atoms/eyebrow";
import { Reveal } from "@/components/atoms/reveal";
import { Button } from "@/components/ui/button";
import { TESTIMONIALS } from "@/content/testimonials";
import type { Locale } from "@/i18n/routing";
import { cn } from "@/lib/utils";

interface TestimonialsProps {
  locale: Locale;
}

export function Testimonials({ locale }: TestimonialsProps) {
  const t = useTranslations("home");
  const isTr = locale === "tr";

  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: "start",
    loop: true,
    skipSnaps: false,
  });
  const [selected, setSelected] = useState(0);
  const [count, setCount] = useState(TESTIMONIALS.length);

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    const onSelect = () => {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSelected(emblaApi.selectedScrollSnap());
    };
    onSelect();
    setCount(emblaApi.scrollSnapList().length);
    emblaApi.on("select", onSelect);
    return () => {
      emblaApi.off("select", onSelect);
    };
  }, [emblaApi]);

  return (
    <section className="bg-surface-1/60">
      <div className="container-editorial section-y">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-12">
          <Reveal>
            <Eyebrow>{isTr ? "MÜŞTERİLERİMİZ" : "FROM OUR CLIENTS"}</Eyebrow>
            <h2 className="text-display text-[clamp(2rem,4.6vw,3.5rem)] leading-tight tracking-tight mt-4 max-w-[20ch]">
              {isTr
                ? "Üç jenerasyon, aynı atölye."
                : "Three generations, one atelier."}
            </h2>
            <p className="mt-4 max-w-xl text-ink-muted leading-relaxed">
              {isTr
                ? "İstanbul'un dört bir yanından, ev sahiplerinden ve onların çocuklarından gelen sözler."
                : "Words from homeowners across İstanbul — and from their children."}
            </p>
          </Reveal>
          <Reveal delayMs={120}>
            <div className="hidden md:flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={scrollPrev}
                aria-label={isTr ? "Önceki" : "Previous"}
                className="h-10 w-10 rounded-full"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={scrollNext}
                aria-label={isTr ? "Sonraki" : "Next"}
                className="h-10 w-10 rounded-full"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </Reveal>
        </div>

        <Reveal delayMs={160}>
          <div ref={emblaRef} className="overflow-hidden -mx-2">
            <div className="flex">
              {TESTIMONIALS.map((tItem, i) => (
                <div
                  key={i}
                  className="shrink-0 grow-0 basis-full md:basis-[calc(50%)] lg:basis-[calc(100%/3)] px-2"
                >
                  <article className="h-full rounded-lg border border-border bg-background p-7 md:p-8 flex flex-col">
                    <Quote className="h-6 w-6 text-brand mb-4" aria-hidden />
                    <p className="text-ink leading-relaxed flex-1">
                      {isTr ? tItem.quoteTr : tItem.quoteEn}
                    </p>
                    <footer className="mt-6 pt-5 border-t border-border">
                      <p className="text-display text-lg tracking-tight">
                        {isTr ? tItem.nameTr : tItem.nameEn}
                      </p>
                      <p className="text-xs uppercase tracking-[0.18em] text-ink-faint mt-1">
                        {isTr ? tItem.locationTr : tItem.locationEn} ·{" "}
                        {isTr ? tItem.projectTypeTr : tItem.projectTypeEn}
                        {tItem.yearWith ? ` · ${tItem.yearWith}` : ""}
                      </p>
                    </footer>
                  </article>
                </div>
              ))}
            </div>
          </div>
        </Reveal>

        <div className="mt-8 flex items-center justify-center gap-2 md:hidden">
          {Array.from({ length: count }).map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => emblaApi?.scrollTo(i)}
              aria-label={`${isTr ? "Yorum" : "Testimonial"} ${i + 1}`}
              className={cn(
                "h-1.5 rounded-full transition-all",
                i === selected ? "w-8 bg-ink" : "w-1.5 bg-border"
              )}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
