import { useTranslations } from "next-intl";
import { Reveal } from "@/components/atoms/reveal";
import { STATS } from "@/config/site";
import type { Locale } from "@/i18n/routing";

interface StatsProps {
  locale: Locale;
}

export function Stats({ locale }: StatsProps) {
  const t = useTranslations("home");
  const isTr = locale === "tr";

  return (
    <section className="bg-ink text-background relative overflow-hidden">
      <div className="absolute inset-0 bg-grain opacity-30" aria-hidden />
      <div className="container-editorial section-y relative">
        <div className="max-w-3xl">
          <Reveal>
            <span className="eyebrow !text-white/70 [&::before]:!bg-brand">
              {t("statsEyebrow")}
            </span>
            <h2
              className="text-display text-[clamp(2rem,4.8vw,3.75rem)] leading-tight tracking-tight mt-5 text-background"
              style={{ fontVariationSettings: '"SOFT" 50, "opsz" 144' }}
            >
              {t("statsTitle")}
            </h2>
          </Reveal>
        </div>

        <ul className="mt-14 grid gap-10 md:grid-cols-2 lg:grid-cols-4">
          {STATS.map((s, i) => (
            <li key={i} className="flex flex-col gap-2">
              <Reveal delayMs={i * 100}>
                <span
                  className="text-display text-5xl md:text-6xl tabular-nums text-brand-soft"
                  style={{ fontVariationSettings: '"SOFT" 100, "opsz" 144' }}
                >
                  {isTr ? s.valueTr : s.valueEn}
                </span>
                <span className="text-xs uppercase tracking-[0.22em] text-white/60">
                  {isTr ? s.labelTr : s.labelEn}
                </span>
              </Reveal>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
