import { setRequestLocale, getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import Image from "next/image";
import { ArrowRight, ArrowLeft } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { Eyebrow } from "@/components/atoms/eyebrow";
import { Reveal } from "@/components/atoms/reveal";
import { JsonLd } from "@/components/atoms/json-ld";
import { ContactCta } from "@/components/sections/contact-cta";
import {
  PROJECTS,
  PROJECT_CATEGORIES,
  getProjectBySlug,
  getNextProject,
} from "@/content/projects";
import { SITE } from "@/config/site";
import { shimmerDataUrl } from "@/lib/utils";
import type { Locale } from "@/i18n/routing";

interface PageProps {
  params: Promise<{ locale: Locale; slug: string }>;
}

export const revalidate = 3600;

export function generateStaticParams() {
  return PROJECTS.flatMap((p) =>
    ["tr", "en"].map((locale) => ({ locale, slug: p.slug }))
  );
}

export async function generateMetadata({ params }: PageProps) {
  const { locale, slug } = await params;
  const project = getProjectBySlug(slug);
  if (!project) return { title: "Not found" };
  const title = locale === "tr" ? project.titleTr : project.titleEn;
  const description = locale === "tr" ? project.summaryTr : project.summaryEn;
  return {
    title,
    description,
    openGraph: {
      title: `${title} · ${SITE.shortName}`,
      description,
      type: "article",
      images: [{ url: project.cover.src, width: 1800, height: 1200, alt: project.cover.alt }],
    },
  };
}

export default async function ProjectDetailPage({ params }: PageProps) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const project = getProjectBySlug(slug);
  if (!project) notFound();
  const t = await getTranslations({ locale, namespace: "portfolio" });
  const isTr = locale === "tr";
  const title = isTr ? project.titleTr : project.titleEn;
  const summary = isTr ? project.summaryTr : project.summaryEn;
  const story = isTr ? project.storyTr : project.storyEn;
  const scope = isTr ? project.scopeTr : project.scopeEn;
  const materials = isTr ? project.materialsTr : project.materialsEn;
  const category =
    PROJECT_CATEGORIES.find((c) => c.key === project.category)?.[isTr ? "labelTr" : "labelEn"] ?? "";
  const next = getNextProject(slug);
  const nextTitle = isTr ? next.titleTr : next.titleEn;

  const ld = {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    name: title,
    description: summary,
    image: project.cover.src,
    creator: { "@type": "Organization", name: SITE.name },
    locationCreated: project.location,
    dateCreated: String(project.year),
  };

  return (
    <>
      <JsonLd data={ld} id={`ld-project-${slug}`} />

      <article className="pb-20">
        <header className="container-editorial pt-12 md:pt-20 pb-10">
          <Link
            href="/portfolio"
            className="inline-flex items-center gap-2 text-sm text-ink-muted hover:text-brand transition-colors group"
          >
            <ArrowLeft className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-1" />
            <span>{t("backToPortfolio")}</span>
          </Link>
          <div className="mt-8 grid gap-10 md:grid-cols-12">
            <div className="md:col-span-8">
              <Eyebrow>{category}</Eyebrow>
              <h1 className="text-display text-[clamp(2.4rem,6vw,5rem)] leading-[1.02] tracking-tight mt-5 max-w-[20ch]">
                {title}
              </h1>
              <p className="mt-6 max-w-2xl text-base md:text-lg text-ink-muted leading-relaxed">
                {summary}
              </p>
            </div>
            <aside className="md:col-span-4 md:pt-2">
              <dl className="grid grid-cols-2 md:grid-cols-1 gap-6 text-sm">
                <Detail label={t("yearLabel")}>{project.year}</Detail>
                <Detail label={t("locationLabel")}>{project.location}</Detail>
                <Detail label={t("categoryLabel")}>{category}</Detail>
              </dl>
            </aside>
          </div>
        </header>

        <Reveal>
          <div className="relative aspect-[3/2] w-full overflow-hidden bg-surface-2">
            <Image
              src={project.cover.src}
              alt={project.cover.alt}
              fill
              priority
              sizes="100vw"
              placeholder="blur"
              blurDataURL={shimmerDataUrl(40, 27)}
              className="object-cover"
            />
          </div>
        </Reveal>

        <section className="container-editorial section-y grid gap-12 md:grid-cols-12">
          <div className="md:col-span-3">
            <Eyebrow>{t("storyLabel")}</Eyebrow>
          </div>
          <div className="md:col-span-9">
            <p className="text-lg md:text-xl text-ink leading-relaxed max-w-3xl">{story}</p>

            <div className="mt-12 grid gap-8 md:grid-cols-2">
              <div>
                <h2 className="eyebrow !text-ink-faint [&::before]:!bg-ink-faint mb-3">
                  {t("scopeLabel")}
                </h2>
                <ul className="space-y-2">
                  {scope.map((item) => (
                    <li key={item} className="flex items-start gap-3 text-ink">
                      <span className="brand-bar mt-3" aria-hidden />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h2 className="eyebrow !text-ink-faint [&::before]:!bg-ink-faint mb-3">
                  {t("materialsLabel")}
                </h2>
                <ul className="flex flex-wrap gap-2">
                  {materials.map((m) => (
                    <li
                      key={m}
                      className="rounded-full border border-border px-3 py-1.5 text-sm text-ink-muted"
                    >
                      {m}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>

        {project.gallery.length > 0 ? (
          <section className="container-editorial pb-20 grid gap-3 md:gap-5 md:grid-cols-2">
            {project.gallery.map((img, i) => (
              <Reveal
                key={i}
                delayMs={i * 60}
                className={i === 0 ? "md:col-span-2" : ""}
              >
                <div
                  className={`relative w-full overflow-hidden bg-surface-2 ${
                    i === 0 ? "aspect-[3/2]" : "aspect-[4/5]"
                  }`}
                >
                  <Image
                    src={img.src}
                    alt={img.alt}
                    fill
                    sizes={i === 0 ? "100vw" : "(max-width: 768px) 100vw, 50vw"}
                    placeholder="blur"
                    blurDataURL={shimmerDataUrl(40, 28)}
                    className="object-cover"
                  />
                </div>
              </Reveal>
            ))}
          </section>
        ) : null}

        <Link
          href={{ pathname: "/portfolio/[slug]", params: { slug: next.slug } }}
          className="block group border-y border-border"
        >
          <div className="container-editorial flex flex-col md:flex-row items-start md:items-center justify-between gap-6 py-12 md:py-16">
            <div>
              <Eyebrow>{t("nextProject")}</Eyebrow>
              <h3
                className="text-display text-3xl md:text-5xl tracking-tight mt-3 group-hover:text-brand transition-colors"
                style={{ fontVariationSettings: '"SOFT" 50, "opsz" 144' }}
              >
                {nextTitle}
              </h3>
            </div>
            <span className="inline-flex items-center gap-2 text-sm font-medium">
              <span>{nextTitle}</span>
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </span>
          </div>
        </Link>
      </article>

      <ContactCta />
    </>
  );
}

function Detail({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="border-t border-border pt-3">
      <dt className="text-[10px] uppercase tracking-[0.22em] text-ink-faint">{label}</dt>
      <dd className="mt-1 text-ink">{children}</dd>
    </div>
  );
}
