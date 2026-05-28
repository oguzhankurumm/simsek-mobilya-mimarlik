"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Trash2, Save, Plus, ChevronUp, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export interface CrudColumn<T> {
  key: keyof T;
  label: string;
  type?: "text" | "number" | "url" | "checkbox";
  width?: string;
}

interface SimpleCrudTableProps<T extends { id: string }> {
  entityKey: string;
  rows: T[];
  columns: CrudColumn<T>[];
  apiPath: string;
  emptyRow: Omit<T, "id">;
  blankLabel?: string;
  /** When true, renders ↑/↓ arrow buttons that PATCH a `displayOrder`
   *  swap between adjacent rows. Rows must already be sorted by their
   *  `displayOrder` value in the parent server component. */
  reorderable?: boolean;
}

// Inline CRUD table used by Ibans, WhatsApp, Categories, Hero admin pages.
// Each row PATCHes individual cells on blur; the "Yeni Ekle" row POSTs to
// the parent route. Keeps admin scaffolding compact — Phase E shipped with
// 4 entities behind one component instead of 4 hand-rolled forms.

export function SimpleCrudTable<T extends { id: string }>({
  rows,
  columns,
  apiPath,
  emptyRow,
  blankLabel = "Yeni Ekle",
  reorderable,
}: SimpleCrudTableProps<T>) {
  const router = useRouter();
  const [savingId, setSavingId] = useState<string | null>(null);
  const [draft, setDraft] = useState<Record<string, unknown>>({ ...emptyRow });
  const [creating, setCreating] = useState(false);

  async function patchCell(id: string, key: keyof T, value: unknown) {
    setSavingId(id);
    const res = await fetch(`${apiPath}/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ [key]: value }),
    });
    setSavingId(null);
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      toast.error(err.error ?? "Kaydedilemedi");
      return;
    }
    router.refresh();
  }

  async function handleMove(id: string, direction: "up" | "down") {
    const index = rows.findIndex((r) => r.id === id);
    const otherIndex = direction === "up" ? index - 1 : index + 1;
    if (index < 0 || otherIndex < 0 || otherIndex >= rows.length) return;

    const a = rows[index] as unknown as Record<string, unknown>;
    const b = rows[otherIndex] as unknown as Record<string, unknown>;
    const orderA = Number(a.displayOrder ?? 0);
    const orderB = Number(b.displayOrder ?? 0);
    // If both rows share the same displayOrder (e.g. all zeroes), bump the
    // moving row by +/- 1 so the swap actually reorders them.
    const swapA = orderA === orderB ? (direction === "up" ? orderB - 1 : orderB + 1) : orderB;
    const swapB = orderA === orderB ? orderA : orderA;

    setSavingId(id);
    await Promise.all([
      fetch(`${apiPath}/${rows[index].id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ displayOrder: swapA }),
      }),
      fetch(`${apiPath}/${rows[otherIndex].id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ displayOrder: swapB }),
      }),
    ]);
    setSavingId(null);
    router.refresh();
  }

  async function handleDelete(id: string) {
    if (!confirm("Silinsin mi?")) return;
    const res = await fetch(`${apiPath}/${id}`, { method: "DELETE" });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      toast.error(err.error ?? "Silinemedi");
      return;
    }
    toast.success("Silindi");
    router.refresh();
  }

  async function handleCreate() {
    setCreating(true);
    const res = await fetch(apiPath, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(draft),
    });
    setCreating(false);
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      toast.error(err.error ?? "Eklenemedi");
      return;
    }
    toast.success("Eklendi");
    setDraft({ ...emptyRow });
    router.refresh();
  }

  return (
    <div className="rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
      <table className="w-full text-sm">
        <thead className="border-b border-zinc-200 text-left text-[10px] uppercase tracking-widest text-zinc-500 dark:border-zinc-800">
          <tr>
            {columns.map((c) => (
              <th key={String(c.key)} className="px-4 py-2.5" style={{ width: c.width }}>
                {c.label}
              </th>
            ))}
            {reorderable ? <th className="w-16 px-2 py-2.5" /> : null}
            <th className="w-12 px-4 py-2.5" />
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
          {rows.map((row, index) => (
            <tr key={row.id} className={cn(savingId === row.id && "opacity-60")}>
              {columns.map((c) => (
                <td key={String(c.key)} className="px-3 py-1.5">
                  <Cell
                    column={c}
                    value={row[c.key]}
                    onCommit={(v) => patchCell(row.id, c.key, v)}
                  />
                </td>
              ))}
              {reorderable ? (
                <td className="px-2 py-1.5">
                  <div className="flex gap-0.5">
                    <button
                      onClick={() => handleMove(row.id, "up")}
                      disabled={index === 0 || savingId === row.id}
                      className="rounded p-1 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-900 disabled:opacity-30 dark:hover:bg-zinc-800"
                      aria-label="Yukarı taşı"
                    >
                      <ChevronUp className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => handleMove(row.id, "down")}
                      disabled={
                        index === rows.length - 1 || savingId === row.id
                      }
                      className="rounded p-1 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-900 disabled:opacity-30 dark:hover:bg-zinc-800"
                      aria-label="Aşağı taşı"
                    >
                      <ChevronDown className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </td>
              ) : null}
              <td className="px-3 py-1.5">
                <button
                  onClick={() => handleDelete(row.id)}
                  className="rounded p-1.5 text-zinc-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950"
                  aria-label="Sil"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </td>
            </tr>
          ))}
          <tr className="bg-zinc-50 dark:bg-zinc-950">
            {columns.map((c) => (
              <td key={String(c.key)} className="px-3 py-1.5">
                <Cell
                  column={c}
                  value={(draft[String(c.key)] ?? "") as unknown}
                  draftMode
                  onCommit={(v) =>
                    setDraft((prev) => ({ ...prev, [String(c.key)]: v }))
                  }
                />
              </td>
            ))}
            {reorderable ? <td /> : null}
            <td className="px-3 py-1.5">
              <button
                onClick={handleCreate}
                disabled={creating}
                aria-label={blankLabel}
                className="rounded p-1.5 text-zinc-400 hover:bg-emerald-50 hover:text-emerald-600 dark:hover:bg-emerald-950"
              >
                {creating ? (
                  <Save className="h-3.5 w-3.5 animate-pulse" />
                ) : (
                  <Plus className="h-3.5 w-3.5" />
                )}
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

function Cell<T>({
  column,
  value,
  onCommit,
  draftMode,
}: {
  column: CrudColumn<T>;
  value: unknown;
  onCommit: (v: unknown) => void;
  draftMode?: boolean;
}) {
  const type = column.type ?? "text";
  const base =
    "w-full bg-transparent text-sm focus:outline-none focus:bg-white dark:focus:bg-zinc-900 rounded px-1.5 py-1";

  if (type === "checkbox") {
    return (
      <input
        type="checkbox"
        checked={Boolean(value)}
        onChange={(e) => onCommit(e.target.checked)}
        className="h-4 w-4 accent-zinc-900"
      />
    );
  }

  if (type === "number") {
    return (
      <input
        type="number"
        defaultValue={typeof value === "number" ? value : ""}
        onBlur={(e) => {
          const n = Number(e.target.value);
          onCommit(Number.isFinite(n) ? n : 0);
        }}
        className={base + " tabular-nums"}
      />
    );
  }

  return (
    <input
      type={type}
      defaultValue={typeof value === "string" ? value : ""}
      onBlur={(e) => {
        const next = e.target.value;
        if (!draftMode && next === value) return;
        onCommit(next);
      }}
      className={base}
    />
  );
}
