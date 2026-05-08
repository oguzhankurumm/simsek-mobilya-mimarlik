import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { shimmerDataUrl, cn } from "@/lib/utils";
import type { Project, ProjectCategory } from "@/content/projects";
import type { Locale } from "@/i18n/routing";

interface ProjectCardProps {
  project: Project;
  locale: Locale;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const ASPECT = {
  sm: "aspect-[4/5]",
  md: "aspect-[3/4]",
  lg: "aspect-[3/2]",
} as const;

const CATEGORY_LABEL: Record<ProjectCategory, { tr: string; en: string }> = {
  living: { tr: "Salon", en: "Living" },
  kitchen: { tr: "Mutfak", en: "Kitchen" },
  bedroom: { tr: "Yatak Odası", en: "Bedroom" },
  bathroom: { tr: "Banyo", en: "Bathroom" },
  office: { tr: "Ofis", en: "Office" },
  architectural: { tr: "Mimari", en: "Architectural" },
  renovation: { tr: "Ev Yenileme", en: "Renovation" },
};

export function ProjectCard({
  project,
  locale,
  size = "md",
  className,
}: ProjectCardProps) {
  const title = locale === "tr" ? project.titleTr : project.titleEn;
  const summary = locale === "tr" ? project.summaryTr : project.summaryEn;
  const category = CATEGORY_LABEL[project.category][locale];

  return (
    <Link
      href={{ pathname: "/portfolio/[slug]", params: { slug: project.slug } }}
      className={cn("group block focus-visible:outline-none", className)}
    >
      <div
        className={cn(
          "relative overflow-hidden rounded-md bg-surface-2",
          "ring-1 ring-border group-hover:ring-border-strong transition",
          "group-focus-visible:ring-2 group-focus-visible:ring-brand",
          ASPECT[size]
        )}
      >
        <Image
          src={project.cover.src}
          alt={project.cover.alt}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
          placeholder="blur"
          blurDataURL={shimmerDataUrl(40, 28)}
          className="object-cover transition-transform duration-1000 ease-out group-hover:scale-[1.04]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/0 to-transparent" />
        <div className="absolute top-3 left-3 flex items-center gap-1.5 rounded-full bg-background/85 backdrop-blur-md px-2.5 py-1 text-[10px] uppercase tracking-[0.18em] text-ink">
          <span className="brand-bar !w-3 !h-px" aria-hidden />
          {category}
        </div>
        <div className="absolute top-3 right-3 rounded-full bg-background/85 backdrop-blur-md p-2 text-ink opacity-0 group-hover:opacity-100 transition-opacity">
          <ArrowUpRight className="h-3.5 w-3.5" />
        </div>
        <div className="absolute bottom-0 left-0 right-0 p-4 md:p-5 text-white">
          <p className="text-[10px] uppercase tracking-[0.22em] text-white/70">
            {project.year} · {project.location}
          </p>
          <h3
            className="text-display text-xl md:text-2xl mt-1 leading-tight tracking-tight"
            style={{ fontVariationSettings: '"SOFT" 50, "opsz" 60' }}
          >
            {title}
          </h3>
        </div>
      </div>
      <p className="mt-3 text-sm text-ink-muted line-clamp-2 max-w-md">{summary}</p>
    </Link>
  );
}
