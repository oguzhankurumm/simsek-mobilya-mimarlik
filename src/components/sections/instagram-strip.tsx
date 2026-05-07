import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { InstagramIcon } from "@/components/atoms/icons";
import { useTranslations } from "next-intl";
import { Eyebrow } from "@/components/atoms/eyebrow";
import { Reveal } from "@/components/atoms/reveal";
import { PROJECTS } from "@/content/projects";
import { SOCIAL } from "@/config/site";
import { shimmerDataUrl } from "@/lib/utils";
import type { Locale } from "@/i18n/routing";

interface InstagramStripProps {
  locale: Locale;
}

export function InstagramStrip({ locale: _locale }: InstagramStripProps) {
  const t = useTranslations("home");
  // Use first 6 project covers as a standin for IG feed
  const tiles = PROJECTS.slice(0, 6).map((p) => p.cover);

  return (
    <section className="container-editorial section-y">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-10">
        <Reveal>
          <Eyebrow>{t("instagramEyebrow")}</Eyebrow>
          <h2 className="text-display text-[clamp(2rem,4.6vw,3.5rem)] leading-tight tracking-tight mt-4 max-w-[18ch]">
            {t("instagramTitle")}
          </h2>
          <p className="mt-4 max-w-xl text-ink-muted leading-relaxed">{t("instagramBody")}</p>
        </Reveal>
        <Reveal delayMs={120}>
          <a
            href={SOCIAL.instagram.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-sm font-medium text-ink hover:text-brand transition-colors group"
          >
            <InstagramIcon className="h-4 w-4" />
            <span>@{SOCIAL.instagram.handle}</span>
            <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
          </a>
        </Reveal>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2 md:gap-3">
        {tiles.map((tile, i) => (
          <Reveal key={i} delayMs={i * 60}>
            <a
              href={SOCIAL.instagram.url}
              target="_blank"
              rel="noopener noreferrer"
              className="block aspect-square relative overflow-hidden rounded-sm bg-surface-2 group ring-1 ring-border hover:ring-brand transition"
              aria-label={tile.alt}
            >
              <Image
                src={tile.src.replace(/w=\d+/, "w=600").replace(/h=\d+/, "h=600")}
                alt=""
                fill
                sizes="(max-width: 768px) 50vw, 17vw"
                placeholder="blur"
                blurDataURL={shimmerDataUrl(20, 20)}
                className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
              />
              <div className="absolute inset-0 grid place-items-center bg-black/0 group-hover:bg-black/40 transition-colors">
                <InstagramIcon className="h-5 w-5 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </a>
          </Reveal>
        ))}
      </div>

      <p className="mt-6 text-xs text-ink-faint">
        {_locale === "tr"
          ? "Görseller Şimşek Mobilya & Mimarlık'a aittir. Gerçek paylaşımlar için Instagram'ımızı ziyaret edin."
          : "Images are illustrative. Visit our Instagram for the live feed."}
      </p>
    </section>
  );
}
