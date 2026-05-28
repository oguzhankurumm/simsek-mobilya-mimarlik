"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search, X } from "lucide-react";

// Search input that writes to ?q= in the URL with a 300ms debounce. The
// /urunler server component re-renders on URL change and refetches with
// the new query. No client state, no extra fetches.

export function ProductSearchBar() {
  const router = useRouter();
  const sp = useSearchParams();
  const initial = sp.get("q") ?? "";
  const [value, setValue] = useState(initial);

  // Keep input synced if the URL changes from elsewhere (chip toggles, sort).
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setValue(sp.get("q") ?? "");
  }, [sp]);

  const push = useCallback(
    (next: string) => {
      const params = new URLSearchParams(sp.toString());
      if (next.trim()) params.set("q", next.trim());
      else params.delete("q");
      router.replace(`/urunler${params.toString() ? `?${params}` : ""}`);
    },
    [router, sp],
  );

  useEffect(() => {
    const handle = setTimeout(() => {
      const current = sp.get("q") ?? "";
      if (value === current) return;
      push(value);
    }, 300);
    return () => clearTimeout(handle);
  }, [value, push, sp]);

  return (
    <div className="relative w-full max-w-md">
      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-faint" />
      <input
        type="search"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Ürün ara… (ad, açıklama, tag)"
        className="w-full rounded-full border border-border bg-background py-2.5 pl-10 pr-9 text-sm text-ink placeholder:text-ink-faint focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
      />
      {value ? (
        <button
          onClick={() => setValue("")}
          aria-label="Aramayı temizle"
          className="absolute right-2 top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-full text-ink-faint hover:bg-surface-2 hover:text-ink"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      ) : null}
    </div>
  );
}
