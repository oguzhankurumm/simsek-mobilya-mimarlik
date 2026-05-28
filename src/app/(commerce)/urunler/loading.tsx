import { ProductGridSkeleton } from "@/components/commerce/product-card-skeleton";

// Streamed during /urunler server work. Header shape matches the loaded
// page so there's no layout jump when products arrive.

export default function UrunlerLoading() {
  return (
    <section className="container-editorial py-8 md:py-14">
      <header className="mb-6 flex flex-col gap-4 md:mb-10">
        <div className="space-y-2">
          <div className="h-2 w-20 animate-pulse rounded bg-surface-2" />
          <div className="h-12 w-48 animate-pulse rounded bg-surface-2" />
          <div className="h-4 w-72 animate-pulse rounded bg-surface-2" />
        </div>
        <div className="h-10 w-full max-w-md animate-pulse rounded-full bg-surface-2" />
        <div className="flex gap-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="h-7 w-20 animate-pulse rounded-full bg-surface-2"
            />
          ))}
        </div>
      </header>
      <ProductGridSkeleton count={8} />
    </section>
  );
}
