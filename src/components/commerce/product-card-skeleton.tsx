// Static skeleton rendered while /urunler streams in. Mirrors ProductCard
// layout: 4:5 aspect placeholder + 3 short text lines. No animation library
// — Tailwind's animate-pulse on the surface-2 tone is plenty.

export function ProductCardSkeleton() {
  return (
    <div className="space-y-3">
      <div className="aspect-[4/5] animate-pulse rounded-md bg-surface-2" />
      <div className="space-y-1">
        <div className="h-2 w-16 animate-pulse rounded bg-surface-2" />
        <div className="h-4 w-4/5 animate-pulse rounded bg-surface-2" />
        <div className="h-3 w-2/5 animate-pulse rounded bg-surface-2" />
        <div className="h-4 w-1/3 animate-pulse rounded bg-surface-2" />
      </div>
    </div>
  );
}

export function ProductGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3 md:gap-x-6 lg:grid-cols-4">
      {Array.from({ length: count }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  );
}
