import { useTranslations } from "next-intl";
import { Eyebrow } from "@/components/atoms/eyebrow";
import { Reveal } from "@/components/atoms/reveal";
import { PROCESS_STEPS } from "@/content/services";
import type { Locale } from "@/i18n/routing";

interface ProcessProps {
  locale: Locale;
}

export function Process({ locale }: ProcessProps) {
  const t = useTranslations("home");
  const isTr = locale === "tr";

  return (
    <section className="container-editorial section-y">
      <div className="max-w-3xl">
        <Reveal>
          <Eyebrow>{t("processEyebrow")}</Eyebrow>
          <h2 className="text-display text-[clamp(2rem,4.6vw,3.5rem)] leading-tight tracking-tight mt-4">
            {t("processTitle")}
          </h2>
        </Reveal>
      </div>

      <ol className="mt-14 grid gap-px bg-border rounded-md overflow-hidden md:grid-cols-2 lg:grid-cols-4 border border-border">
        {PROCESS_STEPS.map((step, i) => (
          <li
            key={step.n}
            className="group relative bg-surface-0 p-7 md:p-8 hover:bg-surface-1 transition-colors"
          >
            <Reveal delayMs={i * 80}>
              <div className="flex items-start gap-4">
                <span
                  className="text-display text-5xl md:text-6xl text-brand/15 font-light leading-none tabular-nums select-none"
                  style={{ fontVariationSettings: '"SOFT" 50, "opsz" 144' }}
                  aria-hidden
                >
                  {step.n}
                </span>
                <div className="flex-1 pt-2">
                  <h3
                    className="text-display text-xl md:text-2xl tracking-tight"
                    style={{ fontVariationSettings: '"SOFT" 50, "opsz" 48' }}
                  >
                    {isTr ? step.titleTr : step.titleEn}
                  </h3>
                  <p className="mt-2 text-sm text-ink-muted leading-relaxed">
                    {isTr ? step.bodyTr : step.bodyEn}
                  </p>
                </div>
              </div>
            </Reveal>
          </li>
        ))}
      </ol>
    </section>
  );
}
