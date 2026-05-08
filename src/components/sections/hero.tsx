"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, MoveDown } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Eyebrow } from "@/components/atoms/eyebrow";
import { shimmerDataUrl } from "@/lib/utils";

const HERO_IMAGE = "/work/kadikoy-evi/02-yemek-odasi.jpg";

export function Hero() {
  const t = useTranslations("home");
  const reduced = useReducedMotion();

  return (
    <section className="relative isolate overflow-hidden bg-editorial">
      {/* Background image */}
      <div className="absolute inset-0 -z-10">
        <Image
          src={HERO_IMAGE}
          alt=""
          fill
          priority
          fetchPriority="high"
          sizes="100vw"
          placeholder="blur"
          blurDataURL={shimmerDataUrl(40, 28)}
          className={
            reduced
              ? "object-cover"
              : "object-cover animate-kenburns will-change-transform"
          }
        />
        {/* Gradient veil */}
        <div className="absolute inset-0 bg-gradient-to-tr from-black/85 via-black/55 to-black/30 dark:from-black/90 dark:via-black/70 dark:to-black/30" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background" />
        <div className="absolute inset-0 bg-grain mix-blend-overlay opacity-40" />
      </div>

      <div className="container-editorial relative pt-28 pb-24 md:pt-40 md:pb-32 lg:pt-56 lg:pb-44 text-white">
        <motion.div
          initial={reduced ? false : { y: 20 }}
          animate={{ y: 0 }}
          transition={{ duration: 0.9, ease: [0.22, 0.61, 0.36, 1] }}
          className="max-w-4xl"
        >
          <Eyebrow className="!text-white/80 mb-8 [&::before]:!bg-brand">
            {t("heroEyebrow")}
          </Eyebrow>

          <h1
            className="text-display text-[clamp(2.6rem,7vw,5.75rem)] leading-[0.95] tracking-tight font-light text-white max-w-[16ch]"
            style={{ fontVariationSettings: '"SOFT" 50, "opsz" 144' }}
          >
            {t("heroLine1")}
            <span className="italic relative inline-block">
              <span className="relative z-10 text-brand-soft">{t("heroLine1Accent")}</span>
              <span
                className="absolute -bottom-1 left-0 right-0 h-[6px] bg-brand/40 -z-0"
                aria-hidden
              />
            </span>
          </h1>

          <p className="mt-8 max-w-xl text-base md:text-lg text-white/80 leading-relaxed">
            {t("heroLine2")}
          </p>

          <div className="mt-10 flex flex-wrap items-center gap-3">
            <Button
              asChild
              size="lg"
              className="rounded-full bg-white text-ink hover:bg-white/90 group h-12 px-6"
            >
              <Link href="/portfolio">
                <span>{t("heroCtaPrimary")}</span>
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="rounded-full bg-transparent border-white/40 text-white hover:bg-white/10 hover:text-white h-12 px-6"
            >
              <Link href="/contact">{t("heroCtaSecondary")}</Link>
            </Button>
          </div>
        </motion.div>

        <motion.div
          initial={reduced ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.1, duration: 0.8 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-white/70 text-xs uppercase tracking-[0.22em]"
          aria-hidden
        >
          <span>{t("scrollHint")}</span>
          <MoveDown className="h-4 w-4 animate-bounce" />
        </motion.div>
      </div>
    </section>
  );
}
