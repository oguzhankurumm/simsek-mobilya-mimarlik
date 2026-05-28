"use client";

import { useEffect, useState } from "react";
import { useRecentlyViewedStore } from "@/lib/store/recently-viewed";
import type { PublicProduct } from "@/lib/products";
import { ProductCard } from "./product-card";

interface RecentlyViewedStripProps {
  /** Full catalog provided server-side; the strip filters and orders it
   *  by the client-side recently-viewed slug list. */
  allProducts: PublicProduct[];
  /** Slug to exclude (i.e. the current product on PDP). */
  excludeSlug?: string;
  title?: string;
}

// Renders the most recently viewed products in the same atelier ProductCard
// layout as the catalog. Hides itself if there are no recents (or only the
// current product). Server fetches the full catalog once via the parent
// page; this client component just chooses which to show.

export function RecentlyViewedStrip({
  allProducts,
  excludeSlug,
  title = "Son Görüntülenenler",
}: RecentlyViewedStripProps) {
  const slugs = useRecentlyViewedStore((s) => s.slugs);
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const filtered = slugs
    .filter((s) => s !== excludeSlug)
    .map((s) => allProducts.find((p) => p.slug === s))
    .filter((p): p is PublicProduct => Boolean(p))
    .slice(0, 4);

  if (filtered.length === 0) return null;

  return (
    <section className="mt-20">
      <h2 className="mb-6 text-xs font-mono uppercase tracking-widest text-ink-faint">
        {title}
      </h2>
      <div className="grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3 lg:grid-cols-4">
        {filtered.map((p) => (
          <ProductCard key={p.id} product={p} variant="compact" />
        ))}
      </div>
    </section>
  );
}
