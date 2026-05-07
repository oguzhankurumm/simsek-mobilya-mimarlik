import type { MetadataRoute } from "next";
import { PROJECTS } from "@/content/projects";
import { SITE } from "@/config/site";

const STATIC_PATHS = [
  { tr: "/", en: "/en", priority: 1 },
  { tr: "/calismalar", en: "/en/work", priority: 0.9 },
  { tr: "/hizmetler", en: "/en/services", priority: 0.8 },
  { tr: "/hakkimizda", en: "/en/about", priority: 0.7 },
  { tr: "/iletisim", en: "/en/contact", priority: 0.7 },
] as const;

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const entries: MetadataRoute.Sitemap = [];

  for (const path of STATIC_PATHS) {
    entries.push({
      url: `${SITE.url}${path.tr}`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: path.priority,
      alternates: {
        languages: {
          tr: `${SITE.url}${path.tr}`,
          en: `${SITE.url}${path.en}`,
        },
      },
    });
  }

  for (const project of PROJECTS) {
    entries.push({
      url: `${SITE.url}/calismalar/${project.slug}`,
      lastModified: now,
      changeFrequency: "yearly",
      priority: 0.6,
      alternates: {
        languages: {
          tr: `${SITE.url}/calismalar/${project.slug}`,
          en: `${SITE.url}/en/work/${project.slug}`,
        },
      },
    });
  }

  return entries;
}
