"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search, X } from "lucide-react";

// Debounced search input wired to the orders list page via `?q=`. Same
// pattern as the public catalog search bar but admin-styled. Searches
// orderNumber, customer name, phone, email (handled server-side).

export function AdminOrderSearch() {
  const router = useRouter();
  const sp = useSearchParams();
  const initial = sp.get("q") ?? "";
  const [value, setValue] = useState(initial);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setValue(sp.get("q") ?? "");
  }, [sp]);

  const push = useCallback(
    (next: string) => {
      const params = new URLSearchParams(sp.toString());
      if (next.trim()) params.set("q", next.trim());
      else params.delete("q");
      router.replace(
        `/admin/dashboard/orders${params.toString() ? `?${params}` : ""}`,
      );
    },
    [router, sp],
  );

  useEffect(() => {
    const handle = setTimeout(() => {
      const current = sp.get("q") ?? "";
      if (value === current) return;
      push(value);
    }, 250);
    return () => clearTimeout(handle);
  }, [value, push, sp]);

  return (
    <div className="relative w-full md:w-80">
      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
      <input
        type="search"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Sipariş no, ad, telefon, email…"
        className="w-full rounded-full border border-zinc-300 bg-white py-2 pl-10 pr-9 text-sm placeholder:text-zinc-400 focus:border-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-300 dark:border-zinc-700 dark:bg-zinc-900 dark:focus:border-zinc-500"
      />
      {value ? (
        <button
          onClick={() => setValue("")}
          aria-label="Aramayı temizle"
          className="absolute right-2 top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-full text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700 dark:hover:bg-zinc-800"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      ) : null}
    </div>
  );
}
