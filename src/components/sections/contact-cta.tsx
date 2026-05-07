import { ArrowRight, Phone } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Eyebrow } from "@/components/atoms/eyebrow";
import { Reveal } from "@/components/atoms/reveal";
import { CONTACT } from "@/config/site";

export function ContactCta() {
  const t = useTranslations("home");
  const tNav = useTranslations("nav");

  return (
    <section className="container-editorial section-y">
      <Reveal className="relative overflow-hidden rounded-lg bg-surface-1 border border-border p-8 md:p-14 lg:p-20">
        <div className="absolute inset-0 -z-10 bg-grain opacity-50" aria-hidden />
        <div
          className="absolute -top-32 -right-32 w-[28rem] h-[28rem] rounded-full bg-brand/10 blur-3xl -z-10"
          aria-hidden
        />
        <div className="grid lg:grid-cols-12 gap-10 items-end">
          <div className="lg:col-span-8">
            <Eyebrow>{t("ctaEyebrow")}</Eyebrow>
            <h2
              className="text-display text-[clamp(2rem,5vw,4rem)] leading-[1.05] tracking-tight mt-5 max-w-[18ch]"
              style={{ fontVariationSettings: '"SOFT" 50, "opsz" 144' }}
            >
              {t("ctaTitle")}
            </h2>
            <p className="mt-5 max-w-xl text-base md:text-lg text-ink-muted leading-relaxed">
              {t("ctaBody")}
            </p>
          </div>
          <div className="lg:col-span-4 flex flex-col gap-3">
            <Button
              asChild
              size="lg"
              className="rounded-full h-12 px-6 group bg-brand text-white hover:bg-brand-deep"
            >
              <Link href="/contact">
                <span>{t("ctaButton")}</span>
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </Button>
            <a
              href={`tel:${CONTACT.phoneE164}`}
              className="inline-flex items-center justify-center gap-2 rounded-full h-12 px-6 border border-border hover:border-ink text-sm font-medium transition-colors"
            >
              <Phone className="h-4 w-4" />
              <span>{tNav("callUs")} · {CONTACT.phoneDisplay}</span>
            </a>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
