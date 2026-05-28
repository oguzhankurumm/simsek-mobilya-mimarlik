"use client";

import { useEffect } from "react";
import { useRecentlyViewedStore } from "@/lib/store/recently-viewed";

// Render-only helper for PDP. On mount it pushes the current product slug
// into the recently-viewed store. Effect runs once per slug change (key
// the page on slug to be safe).

export function TrackProductView({ slug }: { slug: string }) {
  const push = useRecentlyViewedStore((s) => s.push);

  useEffect(() => {
    push(slug);
  }, [slug, push]);

  return null;
}
