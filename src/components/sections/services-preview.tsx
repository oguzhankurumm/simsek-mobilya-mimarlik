import { ArrowRight } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Eyebrow } from "@/components/atoms/eyebrow";
import { Reveal } from "@/components/atoms/reveal";
import { SERVICES } from "@/content/services";
import type { Locale } from "@/i18n/routing";

interface ServicesPreviewProps {
  locale: Locale;
}

export function ServicesPreview({ locale }: ServicesPreviewProps) {
  const t = useTranslations("home");
  const isTr = locale === "tr";

  return (
    <section className="bg-surface-1/60">
      <div className="container-editorial section-y">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-12">
          <Reveal>
            <Eyebrow>{t("servicesEyebrow")}</Eyebrow>
            <h2 className="text-display text-[clamp(2rem,4.6vw,3.5rem)] leading-tight tracking-tight mt-4 max-w-[20ch]">
              {t("servicesTitle")}
            </h2>
          </Reveal>
          <Reveal delayMs={120}>
            <Link
              href="/services"
              className="inline-flex items-center gap-2 text-sm font-medium text-ink hover:text-brand transition-colors group"
            >
              <span>{t("servicesCta")}</span>
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </Reveal>
        </div>

        <ul className="grid gap-px overflow-hidden rounded-md border border-border bg-border lg:grid-cols-2">
          {SERVICES.map((service, i) => {
            const Icon = service.icon;
            const title = isTr ? service.titleTr : service.titleEn;
            const summary = isTr ? service.summaryTr : service.summaryEn;
            return (
              <li
                key={service.slug}
                className="group relative bg-surface-0 p-7 md:p-9 transition-colors hover:bg-surface-1"
              >
                <Reveal delayMs={i * 80}>
                  <div className="flex items-start gap-5">
                    <div className="shrink-0 grid h-12 w-12 place-items-center rounded-md bg-ink text-background transition-colors group-hover:bg-brand">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-baseline justify-between gap-3">
                        <h3
                          className="text-display text-2xl md:text-[1.75rem] tracking-tight"
                          style={{ fontVariationSettings: '"SOFT" 50, "opsz" 48' }}
                        >
                          {title}
                        </h3>
                        <span className="text-xs font-mono text-ink-faint">
                          {String(i + 1).padStart(2, "0")}
                        </span>
                      </div>
                      <p className="mt-3 max-w-md text-ink-muted leading-relaxed">{summary}</p>
                      <Link
                        href={{ pathname: "/services" }}
                        className="mt-5 inline-flex items-center gap-1.5 text-sm font-medium text-brand hover:gap-2.5 transition-[gap]"
                      >
                        <span>
                          {isTr ? "Detayları gör" : "See details"}
                        </span>
                        <ArrowRight className="h-3.5 w-3.5" />
                      </Link>
                    </div>
                  </div>
                </Reveal>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
