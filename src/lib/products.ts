import "server-only";
import { prisma } from "./prisma";
import { tlToKurus } from "./money";
import { DEMO_DATA_ENABLED, logDbFallback } from "./demo-mode";

// Public-facing product shape. All prices in INTEGER kuruş. Created by
// converting Prisma's Decimal at the boundary so the UI never touches
// decimal arithmetic.

export interface PublicProduct {
  id: string;
  slug: string;
  name: string;
  brand: string;
  description: string;
  categorySlug: string;
  categoryName: string;
  originalPriceKurus: number;
  salePriceKurus: number;
  discountPercent: number;
  stock: number;
  featured: boolean;
  images: { url: string; altText: string }[];
  widthCm: number | null;
  depthCm: number | null;
  heightCm: number | null;
  material: string[];
  color: string[];
  room: string | null;
  tags: string[];
}

// Demo-catalog fallback lives in lib/demo-mode.ts (DEMO_DATA_ENABLED). Demo
// state is RETURNED per call (getProductsResult / getProductBySlugResult) — the
// old `export let IS_DEMO_MODE` was a module-level mutable flag mutated during
// async render, which races: request A's DB success could flip the banner off
// for request B mid-render.

export type ProductSort = "yeni" | "fiyat-artan" | "fiyat-azalan" | "oneri";

export type ProductQuery = {
  featured?: boolean;
  categorySlug?: string;
  search?: string;
  sort?: ProductSort;
  limit?: number;
};

export type ProductsResult = { products: PublicProduct[]; isDemo: boolean };

async function fetchProductsFromDb(opts?: {
  featured?: boolean;
  categorySlug?: string;
  search?: string;
  sort?: ProductSort;
  limit?: number;
}): Promise<PublicProduct[]> {
  const where = {
    active: true,
    ...(opts?.featured ? { featured: true } : {}),
    ...(opts?.categorySlug
      ? { category: { slug: opts.categorySlug } }
      : {}),
    ...(opts?.search
      ? {
          OR: [
            { name: { contains: opts.search, mode: "insensitive" as const } },
            { description: { contains: opts.search, mode: "insensitive" as const } },
            { tags: { has: opts.search.toLowerCase() } },
          ],
        }
      : {}),
  };

  const orderBy = (() => {
    switch (opts?.sort) {
      case "fiyat-artan":
        return [{ salePrice: "asc" as const }];
      case "fiyat-azalan":
        return [{ salePrice: "desc" as const }];
      case "yeni":
        return [{ createdAt: "desc" as const }];
      case "oneri":
      default:
        return [
          { featured: "desc" as const },
          { createdAt: "desc" as const },
        ];
    }
  })();

  const products = await prisma.product.findMany({
    where,
    include: {
      category: true,
      images: { orderBy: { displayOrder: "asc" } },
    },
    orderBy,
    take: opts?.limit,
  });

  return products.map((p) => ({
    id: p.id,
    slug: p.slug,
    name: p.name,
    brand: p.brand,
    description: p.description,
    categorySlug: p.category.slug,
    categoryName: p.category.name,
    originalPriceKurus: tlToKurus(p.originalPrice.toString()),
    salePriceKurus: tlToKurus(p.salePrice.toString()),
    discountPercent: p.discountPercent,
    stock: p.stock,
    featured: p.featured,
    images: p.images.map((img) => ({ url: img.url, altText: img.altText })),
    widthCm: p.widthCm,
    depthCm: p.depthCm,
    heightCm: p.heightCm,
    material: p.material,
    color: p.color,
    room: p.room,
    tags: p.tags,
  }));
}

export async function getProductsResult(
  opts?: ProductQuery,
): Promise<ProductsResult> {
  try {
    const dbProducts = await fetchProductsFromDb(opts);
    if (dbProducts.length > 0) return { products: dbProducts, isDemo: false };
    // Empty DB: demo catalog in dev, empty in prod (never fake products).
    if (!DEMO_DATA_ENABLED) return { products: [], isDemo: false };
    return { products: filterMockProducts(MOCK_PRODUCTS, opts), isDemo: true };
  } catch (err) {
    logDbFallback("products", err);
    if (!DEMO_DATA_ENABLED) return { products: [], isDemo: false };
    return { products: filterMockProducts(MOCK_PRODUCTS, opts), isDemo: true };
  }
}

// Convenience wrapper for callers that don't render the demo banner (sitemap,
// related products, featured strip).
export async function getProducts(
  opts?: ProductQuery,
): Promise<PublicProduct[]> {
  return (await getProductsResult(opts)).products;
}

export async function getCategoriesWithCounts(): Promise<
  { name: string; slug: string; count: number }[]
> {
  try {
    const rows = await prisma.category.findMany({
      where: { active: true },
      orderBy: { displayOrder: "asc" },
      select: {
        name: true,
        slug: true,
        _count: { select: { products: { where: { active: true } } } },
      },
    });
    if (rows.length === 0) {
      return DEMO_DATA_ENABLED ? mockCategoriesWithCounts() : [];
    }
    return rows.map((r) => ({
      name: r.name,
      slug: r.slug,
      count: r._count.products,
    }));
  } catch (err) {
    logDbFallback("categories", err);
    return DEMO_DATA_ENABLED ? mockCategoriesWithCounts() : [];
  }
}

function mockCategoriesWithCounts(): {
  name: string;
  slug: string;
  count: number;
}[] {
  const counts = new Map<string, { name: string; count: number }>();
  for (const p of MOCK_PRODUCTS) {
    const existing = counts.get(p.categorySlug);
    if (existing) existing.count++;
    else counts.set(p.categorySlug, { name: p.categoryName, count: 1 });
  }
  return Array.from(counts.entries()).map(([slug, { name, count }]) => ({
    slug,
    name,
    count,
  }));
}

export async function getProductBySlugResult(
  slug: string,
): Promise<{ product: PublicProduct | null; isDemo: boolean }> {
  try {
    const product = await prisma.product.findUnique({
      where: { slug, active: true },
      include: {
        category: true,
        images: { orderBy: { displayOrder: "asc" } },
      },
    });
    if (!product) return { product: null, isDemo: false };
    return {
      product: {
        id: product.id,
        slug: product.slug,
        name: product.name,
        brand: product.brand,
        description: product.description,
        categorySlug: product.category.slug,
        categoryName: product.category.name,
        originalPriceKurus: tlToKurus(product.originalPrice.toString()),
        salePriceKurus: tlToKurus(product.salePrice.toString()),
        discountPercent: product.discountPercent,
        stock: product.stock,
        featured: product.featured,
        images: product.images.map((img) => ({
          url: img.url,
          altText: img.altText,
        })),
        widthCm: product.widthCm,
        depthCm: product.depthCm,
        heightCm: product.heightCm,
        material: product.material,
        color: product.color,
        room: product.room,
        tags: product.tags,
      },
      isDemo: false,
    };
  } catch (err) {
    logDbFallback("products", err);
    if (!DEMO_DATA_ENABLED) return { product: null, isDemo: false };
    return {
      product: MOCK_PRODUCTS.find((p) => p.slug === slug) ?? null,
      isDemo: true,
    };
  }
}

export async function getProductBySlug(
  slug: string,
): Promise<PublicProduct | null> {
  return (await getProductBySlugResult(slug)).product;
}

function filterMockProducts(
  list: PublicProduct[],
  opts?: {
    featured?: boolean;
    categorySlug?: string;
    search?: string;
    sort?: ProductSort;
    limit?: number;
  },
): PublicProduct[] {
  let out = list;
  if (opts?.featured) out = out.filter((p) => p.featured);
  if (opts?.categorySlug)
    out = out.filter((p) => p.categorySlug === opts.categorySlug);
  if (opts?.search) {
    const q = opts.search.toLowerCase();
    out = out.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.tags.some((t) => t.toLowerCase().includes(q)),
    );
  }
  switch (opts?.sort) {
    case "fiyat-artan":
      out = [...out].sort((a, b) => a.salePriceKurus - b.salePriceKurus);
      break;
    case "fiyat-azalan":
      out = [...out].sort((a, b) => b.salePriceKurus - a.salePriceKurus);
      break;
    case "yeni":
      // Mock data has no createdAt; preserve insertion order.
      break;
    case "oneri":
    default:
      out = [...out].sort(
        (a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0),
      );
      break;
  }
  if (opts?.limit) out = out.slice(0, opts.limit);
  return out;
}

// Demo catalog — visible only when DB is empty or unreachable. Pulled from
// the marketing portfolio's existing Instagram-sourced imagery so the demo
// looks editorially consistent with the rest of the site.

export const MOCK_PRODUCTS: PublicProduct[] = [
  {
    id: "demo-1",
    slug: "ceviz-modulu-tv-unitesi",
    name: "Ceviz Modüler TV Ünitesi",
    brand: "Şimşek Mobilya",
    description:
      "Salon duvarınıza tam oturan, gerçek ceviz kaplama modüler TV ünitesi. Gizli kablo kanalı, yumuşak kapanan kapaklar, ayarlanabilir rafları ile.",
    categorySlug: "salon",
    categoryName: "Salon",
    originalPriceKurus: 4_250_000, // 42.500,00 TL
    salePriceKurus: 3_750_000, // 37.500,00 TL
    discountPercent: 12,
    stock: 4,
    featured: true,
    images: [
      {
        url: "https://images.unsplash.com/photo-1592078615290-033ee584e267?auto=format&w=1200&q=80",
        altText: "Ceviz modüler TV ünitesi salon ortamında",
      },
    ],
    widthCm: 260,
    depthCm: 42,
    heightCm: 200,
    material: ["ceviz kaplama", "mdf"],
    color: ["ceviz"],
    room: "salon",
    tags: ["modüler", "tv-ünitesi"],
  },
  {
    id: "demo-2",
    slug: "yag-li-mese-yemek-masasi",
    name: "Yağlı Meşe Yemek Masası 8 Kişilik",
    brand: "Şimşek Mobilya",
    description:
      "Tek parça yağlı meşe tablalı, ferforje metal ayaklı yemek masası. 8 kişilik, doğal damar deseni her parçada eşsiz.",
    categorySlug: "yemek-odasi",
    categoryName: "Yemek Odası",
    originalPriceKurus: 6_500_000,
    salePriceKurus: 5_750_000,
    discountPercent: 11,
    stock: 2,
    featured: true,
    images: [
      {
        url: "https://images.unsplash.com/photo-1577140917170-285929fb55b7?auto=format&w=1200&q=80",
        altText: "Yağlı meşe yemek masası",
      },
    ],
    widthCm: 240,
    depthCm: 100,
    heightCm: 76,
    material: ["meşe", "çelik"],
    color: ["doğal"],
    room: "yemek-odasi",
    tags: ["yemek-masasi", "el-yapımı"],
  },
  {
    id: "demo-3",
    slug: "boucle-koltuk-takimi",
    name: "Bouclé 3+2+1 Koltuk Takımı",
    brand: "Şimşek Mobilya",
    description:
      "Krem bouclé kumaş, ahşap iskelet, yüksek yoğunluklu sünger. Yıllarca formunu korur.",
    categorySlug: "salon",
    categoryName: "Salon",
    originalPriceKurus: 8_900_000,
    salePriceKurus: 7_500_000,
    discountPercent: 16,
    stock: 1,
    featured: true,
    images: [
      {
        url: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&w=1200&q=80",
        altText: "Bouclé koltuk takımı",
      },
    ],
    widthCm: 320,
    depthCm: 95,
    heightCm: 85,
    material: ["bouclé", "ahşap"],
    color: ["krem"],
    room: "salon",
    tags: ["koltuk-takimi"],
  },
  {
    id: "demo-4",
    slug: "san-tve-modulu-yatak-bazasi",
    name: "Santveç Modüler Yatak Bazası",
    brand: "Şimşek Mobilya",
    description:
      "Kapaklı, hidrolik mekanizmalı, çift kişilik 160×200 baza. Kaplama opsiyonları.",
    categorySlug: "yatak-odasi",
    categoryName: "Yatak Odası",
    originalPriceKurus: 2_850_000,
    salePriceKurus: 2_450_000,
    discountPercent: 14,
    stock: 6,
    featured: false,
    images: [
      {
        url: "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&w=1200&q=80",
        altText: "Modüler yatak bazası",
      },
    ],
    widthCm: 160,
    depthCm: 200,
    heightCm: 40,
    material: ["mdf", "kumaş"],
    color: ["antrasit"],
    room: "yatak-odasi",
    tags: ["baza"],
  },
  {
    id: "demo-5",
    slug: "el-yapimi-konsol-aynaki",
    name: "El Yapımı Konsol & Ayna Seti",
    brand: "Şimşek Mobilya",
    description:
      "Antre için ölçüye uyarlanabilir konsol + duvar aynası. Yapım süresi 3 hafta.",
    categorySlug: "antre",
    categoryName: "Antre",
    originalPriceKurus: 1_950_000,
    salePriceKurus: 1_750_000,
    discountPercent: 10,
    stock: 0,
    featured: false,
    images: [
      {
        url: "https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?auto=format&w=1200&q=80",
        altText: "Konsol ve ayna seti",
      },
    ],
    widthCm: 120,
    depthCm: 38,
    heightCm: 85,
    material: ["meşe", "cam"],
    color: ["doğal", "siyah"],
    room: "antre",
    tags: ["konsol"],
  },
  {
    id: "demo-6",
    slug: "mutfak-konsol-adasi",
    name: "Mutfak Konsol Adası",
    brand: "Şimşek Mobilya",
    description:
      "Mermer tezgah üstlü, depolu mutfak adası. Tezgah seçenekleri.",
    categorySlug: "mutfak",
    categoryName: "Mutfak",
    originalPriceKurus: 5_500_000,
    salePriceKurus: 4_850_000,
    discountPercent: 12,
    stock: 3,
    featured: true,
    images: [
      {
        url: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?auto=format&w=1200&q=80",
        altText: "Mutfak konsol adası",
      },
    ],
    widthCm: 200,
    depthCm: 90,
    heightCm: 92,
    material: ["mermer", "mdf"],
    color: ["beyaz"],
    room: "mutfak",
    tags: ["mutfak-adasi"],
  },
];
