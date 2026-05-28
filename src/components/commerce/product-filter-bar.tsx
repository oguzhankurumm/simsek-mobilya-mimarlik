"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";

interface CategoryChip {
  name: string;
  slug: string;
  count: number;
}

interface ProductFilterBarProps {
  categories: CategoryChip[];
}

const SORTS: { value: string; label: string }[] = [
  { value: "oneri", label: "Önerilen" },
  { value: "yeni", label: "Yeni" },
  { value: "fiyat-artan", label: "Fiyat ↑" },
  { value: "fiyat-azalan", label: "Fiyat ↓" },
];

// Renders two scroll-on-mobile rows: category chips + sort chips. Toggles
// query params on click — server component picks them up. No client state.
// Phase 2 review T05: drawer-filter dropped in favour of inline chips for
// the 5-10 SKU launch.

export function ProductFilterBar({ categories }: ProductFilterBarProps) {
  const sp = useSearchParams();
  const activeCategory = sp.get("kategori") ?? "";
  const activeSort = sp.get("sirala") ?? "oneri";
  const q = sp.get("q") ?? "";

  function buildHref(updates: Record<string, string>): string {
    const next = new URLSearchParams(sp.toString());
    for (const [k, v] of Object.entries(updates)) {
      if (v) next.set(k, v);
      else next.delete(k);
    }
    const str = next.toString();
    return `/urunler${str ? `?${str}` : ""}`;
  }

  return (
    <div className="space-y-3">
      {categories.length > 0 ? (
        <div className="-mx-4 overflow-x-auto px-4 md:mx-0 md:px-0">
          <ul className="flex w-max gap-2 md:flex-wrap md:w-auto">
            <li>
              <Link
                href={buildHref({ kategori: "", q })}
                className={cn(
                  "inline-flex items-center rounded-full px-4 py-1.5 text-xs font-medium transition-colors",
                  !activeCategory
                    ? "bg-ink text-background"
                    : "border border-border text-ink-muted hover:bg-surface-2",
                )}
              >
                Tümü
              </Link>
            </li>
            {categories.map((c) => (
              <li key={c.slug}>
                <Link
                  href={buildHref({ kategori: c.slug, q })}
                  className={cn(
                    "inline-flex items-center gap-1 rounded-full px-4 py-1.5 text-xs font-medium transition-colors",
                    activeCategory === c.slug
                      ? "bg-ink text-background"
                      : "border border-border text-ink-muted hover:bg-surface-2",
                  )}
                >
                  {c.name}
                  <span className="opacity-60 tabular-nums">({c.count})</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border pt-3">
        <p className="text-[10px] font-mono uppercase tracking-widest text-ink-faint">
          Sırala
        </p>
        <ul className="flex flex-wrap gap-1.5">
          {SORTS.map((s) => (
            <li key={s.value}>
              <Link
                href={buildHref({ sirala: s.value })}
                className={cn(
                  "inline-flex items-center rounded-full px-3 py-1 text-xs transition-colors",
                  activeSort === s.value
                    ? "bg-ink text-background"
                    : "border border-border text-ink-muted hover:bg-surface-2",
                )}
              >
                {s.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
