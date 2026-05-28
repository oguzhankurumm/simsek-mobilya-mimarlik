// Streamed while admin orders list resolves. Matches the page header +
// search bar + filter chip shapes.

export default function OrdersLoading() {
  return (
    <div className="space-y-6">
      <header className="space-y-4">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div className="space-y-2">
            <div className="h-2 w-24 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
            <div className="h-8 w-40 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
          </div>
          <div className="h-9 w-72 animate-pulse rounded-full bg-zinc-200 dark:bg-zinc-800" />
        </div>
        <div className="flex flex-wrap gap-1.5">
          {Array.from({ length: 7 }).map((_, i) => (
            <div
              key={i}
              className="h-6 w-20 animate-pulse rounded-full bg-zinc-200 dark:bg-zinc-800"
            />
          ))}
        </div>
      </header>
      <div className="rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
        <table className="w-full">
          <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
            {Array.from({ length: 8 }).map((_, i) => (
              <tr key={i}>
                <td className="px-4 py-4">
                  <div className="h-4 w-24 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
                </td>
                <td className="px-4 py-4">
                  <div className="h-4 w-40 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
                </td>
                <td className="px-4 py-4">
                  <div className="h-4 w-8 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
                </td>
                <td className="px-4 py-4">
                  <div className="h-4 w-20 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
                </td>
                <td className="px-4 py-4">
                  <div className="h-5 w-16 animate-pulse rounded-full bg-zinc-200 dark:bg-zinc-800" />
                </td>
                <td className="px-4 py-4">
                  <div className="h-4 w-20 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
