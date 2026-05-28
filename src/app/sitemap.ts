import type { MetadataRoute } from "next";
import { PROJECTS } from "@/content/projects";
import { SITE } from "@/config/site";
import { getProducts } from "@/lib/products";

const STATIC_PATHS = [
  { tr: "/", en: "/en", priority: 1 },
  { tr: "/calismalar", en: "/en/work", priority: 0.9 },
  { tr: "/hizmetler", en: "/en/services", priority: 0.8 },
  { tr: "/hakkimizda", en: "/en/about", priority: 0.7 },
  { tr: "/iletisim", en: "/en/contact", priority: 0.7 },
] as const;

// TR-only commerce routes — no hreflang alternates, no EN counterpart.
const TR_ONLY_PATHS = [
  { path: "/urunler", priority: 0.95, freq: "daily" },
  { path: "/siparis-takibi", priority: 0.5, freq: "yearly" },
  { path: "/mesafeli-satis-sozlesmesi", priority: 0.4, freq: "yearly" },
  { path: "/on-bilgilendirme", priority: 0.4, freq: "yearly" },
  { path: "/cayma-hakki", priority: 0.4, freq: "yearly" },
  { path: "/iade-politikasi", priority: 0.4, freq: "yearly" },
] as const;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
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

  for (const p of TR_ONLY_PATHS) {
    entries.push({
      url: `${SITE.url}${p.path}`,
      lastModified: now,
      changeFrequency: p.freq,
      priority: p.priority,
    });
  }

  // Live product slugs — falls back to MOCK_PRODUCTS in dev / when DB is
  // unreachable, so the sitemap never crashes a build. We attach product
  // images via the `images` field; Google reads the image sitemap signal
  // off the regular sitemap when entries include this key.
  const products = await getProducts();
  for (const product of products) {
    entries.push({
      url: `${SITE.url}/urunler/${product.slug}`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.75,
      images: product.images
        .map((img) => img.url)
        .filter((url): url is string => Boolean(url))
        .slice(0, 5),
    });
  }

  return entries;
}
