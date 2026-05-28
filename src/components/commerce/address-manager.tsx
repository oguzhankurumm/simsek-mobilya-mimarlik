"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { MapPin, Plus, Trash2, Star } from "lucide-react";
import { cn } from "@/lib/utils";

export interface AddressRow {
  id: string;
  title: string;
  fullName: string;
  phone: string;
  city: string;
  district: string;
  addressLine: string;
  isDefault: boolean;
}

interface AddressManagerProps {
  addresses: AddressRow[];
}

const fieldStyles =
  "w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20";

export function AddressManager({ addresses }: AddressManagerProps) {
  const router = useRouter();
  const [adding, setAdding] = useState(false);
  const [busy, setBusy] = useState(false);

  async function handleAdd(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    setBusy(true);
    const res = await fetch("/api/user/addresses", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: String(fd.get("title") ?? ""),
        fullName: String(fd.get("fullName") ?? ""),
        phone: String(fd.get("phone") ?? ""),
        city: String(fd.get("city") ?? ""),
        district: String(fd.get("district") ?? ""),
        addressLine: String(fd.get("addressLine") ?? ""),
        isDefault: fd.get("isDefault") === "on",
      }),
    });
    setBusy(false);
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      toast.error(err.error ?? "Adres eklenemedi");
      return;
    }
    toast.success("Adres eklendi");
    setAdding(false);
    router.refresh();
  }

  async function handleDefault(id: string) {
    const res = await fetch(`/api/user/addresses/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isDefault: true }),
    });
    if (!res.ok) {
      toast.error("Varsayılan ayarlanamadı");
      return;
    }
    toast.success("Varsayılan adres güncellendi");
    router.refresh();
  }

  async function handleDelete(id: string) {
    if (!confirm("Adres silinsin mi?")) return;
    const res = await fetch(`/api/user/addresses/${id}`, {
      method: "DELETE",
    });
    if (!res.ok) {
      toast.error("Silinemedi");
      return;
    }
    toast.success("Adres silindi");
    router.refresh();
  }

  return (
    <div className="space-y-4">
      {addresses.length === 0 && !adding ? (
        <div className="rounded-md border border-dashed border-border px-3 py-6 text-center text-sm text-ink-muted">
          Kayıtlı adresiniz yok.
        </div>
      ) : (
        <ul className="space-y-3">
          {addresses.map((addr) => (
            <li
              key={addr.id}
              className={cn(
                "rounded-xl border p-4 transition-colors",
                addr.isDefault
                  ? "border-brand bg-brand/5"
                  : "border-border bg-background",
              )}
            >
              <div className="flex items-start gap-3">
                <MapPin className="mt-0.5 h-4 w-4 text-ink-muted" />
                <div className="flex-1 space-y-0.5 text-sm">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-medium">{addr.title}</p>
                    {addr.isDefault ? (
                      <span className="rounded-full bg-brand/15 px-2 py-0.5 text-[10px] font-medium text-brand">
                        Varsayılan
                      </span>
                    ) : null}
                  </div>
                  <p className="text-xs text-ink-muted">
                    {addr.fullName} · {addr.phone}
                  </p>
                  <p className="text-xs">
                    {addr.addressLine}, {addr.district}/{addr.city}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-2">
                  {!addr.isDefault ? (
                    <button
                      onClick={() => handleDefault(addr.id)}
                      className="inline-flex items-center gap-1 rounded-full border border-border px-2.5 py-1 text-[10px] text-ink-muted hover:bg-surface-2"
                    >
                      <Star className="h-3 w-3" /> Varsayılan yap
                    </button>
                  ) : null}
                  <button
                    onClick={() => handleDelete(addr.id)}
                    className="inline-flex items-center gap-1 rounded-full border border-border px-2.5 py-1 text-[10px] text-red-600 hover:bg-red-50 dark:hover:bg-red-950"
                  >
                    <Trash2 className="h-3 w-3" /> Sil
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}

      {adding ? (
        <form
          onSubmit={handleAdd}
          className="space-y-3 rounded-xl border border-border bg-surface-2/40 p-4 text-sm"
        >
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <label className="block">
              <span className="mb-1 block text-[10px] uppercase tracking-wide text-ink-muted">
                Başlık (ev, ofis…)
              </span>
              <input name="title" required className={fieldStyles} />
            </label>
            <label className="block">
              <span className="mb-1 block text-[10px] uppercase tracking-wide text-ink-muted">
                Ad Soyad
              </span>
              <input name="fullName" required className={fieldStyles} />
            </label>
            <label className="block">
              <span className="mb-1 block text-[10px] uppercase tracking-wide text-ink-muted">
                Telefon
              </span>
              <input
                type="tel"
                name="phone"
                inputMode="tel"
                required
                className={fieldStyles}
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-[10px] uppercase tracking-wide text-ink-muted">
                İl
              </span>
              <input name="city" required className={fieldStyles} />
            </label>
            <label className="block">
              <span className="mb-1 block text-[10px] uppercase tracking-wide text-ink-muted">
                İlçe
              </span>
              <input name="district" required className={fieldStyles} />
            </label>
          </div>
          <label className="block">
            <span className="mb-1 block text-[10px] uppercase tracking-wide text-ink-muted">
              Açık Adres
            </span>
            <textarea
              name="addressLine"
              rows={2}
              required
              className={fieldStyles}
            />
          </label>
          <label className="flex items-center gap-2 text-xs">
            <input
              type="checkbox"
              name="isDefault"
              className="h-3.5 w-3.5 accent-brand"
            />
            Varsayılan adres olsun
          </label>
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={busy}
              className="rounded-full bg-brand px-5 py-2 text-xs font-semibold text-white hover:bg-brand/90 disabled:opacity-60"
            >
              {busy ? "Kaydediliyor…" : "Adresi Kaydet"}
            </button>
            <button
              type="button"
              onClick={() => setAdding(false)}
              className="rounded-full border border-border px-4 py-2 text-xs hover:bg-surface-2"
            >
              Vazgeç
            </button>
          </div>
        </form>
      ) : (
        <button
          onClick={() => setAdding(true)}
          className="inline-flex items-center gap-1.5 rounded-full border border-dashed border-border px-4 py-2 text-xs text-ink-muted hover:border-brand hover:text-brand"
        >
          <Plus className="h-3.5 w-3.5" /> Yeni adres ekle
        </button>
      )}
    </div>
  );
}
