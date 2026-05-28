"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Command } from "cmdk";
import {
  Search,
  Package,
  ShoppingCart,
  Users,
  LayoutDashboard,
  Settings as SettingsIcon,
  Landmark,
  MessageCircle,
  FolderTree,
  Image as ImageIcon,
  Bell,
} from "lucide-react";

// Cmd+K / Ctrl+K command palette for admin. Opens a Radix Dialog-esque
// floating panel with three sections:
//   1. Quick links (always shown) — dashboard navigation
//   2. Live search results (fetched via /api/admin/search debounced) —
//      matching orders/products/customers
// Closes on Escape, item click, or backdrop click.

const SHORTCUTS = [
  { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/dashboard/orders", label: "Siparişler", icon: ShoppingCart },
  { href: "/admin/dashboard/products", label: "Ürünler", icon: Package },
  { href: "/admin/dashboard/customers", label: "Müşteriler", icon: Users },
  { href: "/admin/dashboard/categories", label: "Kategoriler", icon: FolderTree },
  {
    href: "/admin/dashboard/stock-notifications",
    label: "Stok Bildirimleri",
    icon: Bell,
  },
  { href: "/admin/dashboard/ibans", label: "IBAN'lar", icon: Landmark },
  { href: "/admin/dashboard/whatsapp", label: "WhatsApp", icon: MessageCircle },
  { href: "/admin/dashboard/hero", label: "Hero Slides", icon: ImageIcon },
  { href: "/admin/dashboard/settings", label: "Ayarlar", icon: SettingsIcon },
] as const;

interface SearchResults {
  orders: { orderNumber: string; status: string; guestName: string | null; user: { name: string } | null }[];
  products: { id: string; name: string; slug: string; active: boolean; stock: number }[];
  customers: { id: string; name: string; email: string; phone: string | null }[];
}

const EMPTY: SearchResults = { orders: [], products: [], customers: [] };

export function CommandPalette() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResults>(EMPTY);
  const [loading, setLoading] = useState(false);

  // Cmd+K / Ctrl+K toggle.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((v) => !v);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // Debounced search.
  useEffect(() => {
    if (!open) return;
    if (!query.trim()) {
      setResults(EMPTY);
      return;
    }
    let cancelled = false;
    const handle = setTimeout(() => {
      setLoading(true);
      fetch(`/api/admin/search?q=${encodeURIComponent(query.trim())}`)
        .then((r) => (r.ok ? r.json() : EMPTY))
        .then((data: SearchResults) => {
          if (!cancelled) setResults(data ?? EMPTY);
        })
        .catch(() => undefined)
        .finally(() => {
          if (!cancelled) setLoading(false);
        });
    }, 200);
    return () => {
      cancelled = true;
      clearTimeout(handle);
    };
  }, [query, open]);

  function go(href: string) {
    setOpen(false);
    setQuery("");
    router.push(href);
  }

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[80] flex items-start justify-center bg-black/40 backdrop-blur-sm"
      onClick={() => setOpen(false)}
      role="presentation"
    >
      <div
        className="mt-24 w-full max-w-lg rounded-2xl border border-zinc-200 bg-white shadow-2xl dark:border-zinc-700 dark:bg-zinc-900"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="Komut paleti"
      >
        <Command label="Komut paleti" shouldFilter={false}>
          <div className="flex items-center gap-2 border-b border-zinc-200 px-3 dark:border-zinc-800">
            <Search className="h-4 w-4 text-zinc-400" />
            <Command.Input
              autoFocus
              value={query}
              onValueChange={setQuery}
              placeholder="Sipariş, ürün, müşteri ara… veya bir sayfaya git"
              className="flex-1 bg-transparent py-3 text-sm placeholder:text-zinc-400 focus:outline-none"
            />
            <kbd className="rounded border border-zinc-200 px-1.5 py-0.5 text-[10px] text-zinc-500 dark:border-zinc-700">
              ESC
            </kbd>
          </div>
          <Command.List className="max-h-[60vh] overflow-y-auto p-2">
            <Command.Empty className="px-3 py-6 text-center text-sm text-zinc-500">
              {loading ? "Aranıyor…" : "Sonuç yok."}
            </Command.Empty>

            {!query.trim() ? (
              <Command.Group heading="Hızlı Git" className="text-xs text-zinc-500">
                {SHORTCUTS.map((s) => {
                  const Icon = s.icon;
                  return (
                    <Command.Item
                      key={s.href}
                      onSelect={() => go(s.href)}
                      className="flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-sm aria-selected:bg-zinc-100 dark:aria-selected:bg-zinc-800"
                    >
                      <Icon className="h-4 w-4 text-zinc-500" />
                      {s.label}
                    </Command.Item>
                  );
                })}
              </Command.Group>
            ) : null}

            {results.orders.length > 0 ? (
              <Command.Group heading="Siparişler" className="text-xs text-zinc-500">
                {results.orders.map((o) => (
                  <Command.Item
                    key={o.orderNumber}
                    onSelect={() =>
                      go(`/admin/dashboard/orders/${o.orderNumber}`)
                    }
                    className="flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-sm aria-selected:bg-zinc-100 dark:aria-selected:bg-zinc-800"
                  >
                    <ShoppingCart className="h-4 w-4 text-zinc-500" />
                    <span className="tabular-nums">{o.orderNumber}</span>
                    <span className="text-xs text-zinc-500">
                      · {o.user?.name ?? o.guestName ?? "(Konuk)"} · {o.status}
                    </span>
                  </Command.Item>
                ))}
              </Command.Group>
            ) : null}

            {results.products.length > 0 ? (
              <Command.Group heading="Ürünler" className="text-xs text-zinc-500">
                {results.products.map((p) => (
                  <Command.Item
                    key={p.id}
                    onSelect={() => go(`/admin/dashboard/products/${p.id}`)}
                    className="flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-sm aria-selected:bg-zinc-100 dark:aria-selected:bg-zinc-800"
                  >
                    <Package className="h-4 w-4 text-zinc-500" />
                    {p.name}
                    <span className="text-xs text-zinc-500">
                      · stok {p.stock} {p.active ? "" : "· pasif"}
                    </span>
                  </Command.Item>
                ))}
              </Command.Group>
            ) : null}

            {results.customers.length > 0 ? (
              <Command.Group heading="Müşteriler" className="text-xs text-zinc-500">
                {results.customers.map((c) => (
                  <Command.Item
                    key={c.id}
                    onSelect={() => go(`/admin/dashboard/customers`)}
                    className="flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-sm aria-selected:bg-zinc-100 dark:aria-selected:bg-zinc-800"
                  >
                    <Users className="h-4 w-4 text-zinc-500" />
                    {c.name}
                    <span className="text-xs text-zinc-500">· {c.email}</span>
                  </Command.Item>
                ))}
              </Command.Group>
            ) : null}
          </Command.List>

          <div className="border-t border-zinc-200 px-3 py-2 text-[10px] text-zinc-400 dark:border-zinc-800">
            <kbd className="rounded border border-zinc-200 px-1 py-0.5 dark:border-zinc-700">⌘K</kbd>{" "}
            ya da{" "}
            <kbd className="rounded border border-zinc-200 px-1 py-0.5 dark:border-zinc-700">Ctrl+K</kbd>{" "}
            ile aç/kapa
          </div>
        </Command>
      </div>
    </div>
  );
}
