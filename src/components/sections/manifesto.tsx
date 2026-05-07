import { useTranslations } from "next-intl";
import { Eyebrow } from "@/components/atoms/eyebrow";
import { Reveal } from "@/components/atoms/reveal";

export function Manifesto() {
  const t = useTranslations("home");

  return (
    <section className="container-editorial section-y">
      <div className="grid gap-12 lg:grid-cols-12 lg:gap-20">
        <div className="lg:col-span-4">
          <Reveal>
            <Eyebrow>{t("manifestoEyebrow")}</Eyebrow>
            <p className="mt-6 text-sm text-ink-muted leading-relaxed">
              Şimşek Mobilya & Mimarlık
              <br />
              <span className="text-ink-faint">— İstanbul, 1997</span>
            </p>
          </Reveal>
        </div>

        <div className="lg:col-span-8">
          <Reveal delayMs={120}>
            <h2 className="text-display text-[clamp(2rem,4.6vw,3.75rem)] leading-[1.05] tracking-tight max-w-[22ch]">
              {t("manifestoTitle")}
            </h2>
          </Reveal>
          <Reveal delayMs={240}>
            <p className="mt-8 max-w-2xl text-base md:text-lg text-ink-muted leading-relaxed">
              {t("manifestoBody1")}
            </p>
          </Reveal>
          <Reveal delayMs={360}>
            <p className="mt-4 max-w-2xl text-base md:text-lg text-ink-muted leading-relaxed">
              {t("manifestoBody2")}
            </p>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
