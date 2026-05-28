// PDP skeleton. Two-column layout matches the loaded page so the gallery
// shape stays stable.

export default function PdpLoading() {
  return (
    <section className="container-editorial py-6 md:py-12">
      <div className="mb-6 h-4 w-32 animate-pulse rounded bg-surface-2" />
      <div className="grid grid-cols-1 gap-8 md:grid-cols-2 md:gap-12">
        <div className="aspect-[4/5] animate-pulse rounded-md bg-surface-2" />
        <div className="flex flex-col gap-4">
          <div className="h-2 w-20 animate-pulse rounded bg-surface-2" />
          <div className="h-10 w-3/4 animate-pulse rounded bg-surface-2" />
          <div className="h-9 w-32 animate-pulse rounded bg-surface-2" />
          <div className="h-3 w-48 animate-pulse rounded bg-surface-2" />
          <div className="mt-2 space-y-2">
            <div className="h-3 w-full animate-pulse rounded bg-surface-2" />
            <div className="h-3 w-5/6 animate-pulse rounded bg-surface-2" />
            <div className="h-3 w-4/6 animate-pulse rounded bg-surface-2" />
          </div>
          <div className="mt-3 grid grid-cols-2 gap-3 border-y border-border py-5">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="space-y-1">
                <div className="h-2 w-12 animate-pulse rounded bg-surface-2" />
                <div className="h-4 w-24 animate-pulse rounded bg-surface-2" />
              </div>
            ))}
          </div>
          <div className="flex gap-3">
            <div className="h-12 w-40 animate-pulse rounded-full bg-surface-2" />
            <div className="h-12 w-40 animate-pulse rounded-full bg-surface-2" />
          </div>
        </div>
      </div>
    </section>
  );
}
