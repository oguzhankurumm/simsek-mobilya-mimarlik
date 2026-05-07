import { ArrowRight } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Eyebrow } from "@/components/atoms/eyebrow";
import { Reveal } from "@/components/atoms/reveal";
import { ProjectCard } from "@/components/portfolio/project-card";
import { FEATURED_PROJECTS } from "@/content/projects";
import type { Locale } from "@/i18n/routing";

interface FeaturedProjectsProps {
  locale: Locale;
}

export function FeaturedProjects({ locale }: FeaturedProjectsProps) {
  const t = useTranslations("home");

  return (
    <section className="container-editorial section-y">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-12">
        <Reveal>
          <Eyebrow>{t("featuredEyebrow")}</Eyebrow>
          <h2 className="text-display text-[clamp(2rem,4.6vw,3.5rem)] leading-tight tracking-tight mt-4 max-w-[20ch]">
            {t("featuredTitle")}
          </h2>
        </Reveal>
        <Reveal delayMs={120}>
          <Link
            href="/portfolio"
            className="inline-flex items-center gap-2 text-sm font-medium text-ink hover:text-brand transition-colors group"
          >
            <span>{t("featuredCta")}</span>
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </Reveal>
      </div>

      <div className="grid gap-6 md:gap-8 md:grid-cols-2 lg:grid-cols-3">
        {FEATURED_PROJECTS.map((project, i) => (
          <Reveal key={project.slug} delayMs={i * 90}>
            <ProjectCard project={project} locale={locale} />
          </Reveal>
        ))}
      </div>
    </section>
  );
}
