"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { slugify } from "@/lib/utils";

interface ProductFormProps {
  categories: { id: string; name: string }[];
  product?: {
    id: string;
    name: string;
    slug: string;
    categoryId: string;
    description: string;
    originalPrice: string;
    salePrice: string;
    stock: number;
    featured: boolean;
    active: boolean;
    imageUrl: string;
    widthCm: number | null;
    depthCm: number | null;
    heightCm: number | null;
    material: string[];
    color: string[];
    room: string | null;
  };
}

const fieldStyles =
  "w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900";

export function ProductForm({ categories, product }: ProductFormProps) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const isEdit = !!product;

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);

    const formData = new FormData(e.currentTarget);
    const body = {
      name: String(formData.get("name") ?? ""),
      slug:
        String(formData.get("slug") ?? "") ||
        slugify(String(formData.get("name") ?? "")),
      categoryId: String(formData.get("categoryId") ?? ""),
      description: String(formData.get("description") ?? ""),
      originalPrice: Number(formData.get("originalPrice") ?? 0),
      salePrice: Number(formData.get("salePrice") ?? 0),
      stock: Number(formData.get("stock") ?? 0),
      featured: formData.get("featured") === "on",
      active: formData.get("active") === "on",
      imageUrl: String(formData.get("imageUrl") ?? ""),
      widthCm: numberOrNull(formData.get("widthCm")),
      depthCm: numberOrNull(formData.get("depthCm")),
      heightCm: numberOrNull(formData.get("heightCm")),
      material: splitList(formData.get("material")),
      color: splitList(formData.get("color")),
      room: String(formData.get("room") ?? "") || null,
    };

    const url = isEdit
      ? `/api/admin/products/${product!.id}`
      : `/api/admin/products`;
    const res = await fetch(url, {
      method: isEdit ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    setSubmitting(false);
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      toast.error(err.error ?? "Kaydedilemedi");
      return;
    }
    toast.success(isEdit ? "Ürün güncellendi" : "Ürün eklendi");
    router.push("/admin/dashboard/products");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5 max-w-3xl">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <label className="block">
          <span className="mb-1 block text-xs uppercase tracking-wide text-zinc-500">
            Ürün Adı
          </span>
          <input
            name="name"
            required
            defaultValue={product?.name}
            className={fieldStyles}
          />
        </label>
        <label className="block">
          <span className="mb-1 block text-xs uppercase tracking-wide text-zinc-500">
            Slug (boş bırak otomatik)
          </span>
          <input
            name="slug"
            defaultValue={product?.slug}
            placeholder="ornek-koltuk"
            className={fieldStyles + " font-mono lowercase"}
          />
        </label>
        <label className="block">
          <span className="mb-1 block text-xs uppercase tracking-wide text-zinc-500">
            Kategori
          </span>
          <select
            name="categoryId"
            defaultValue={product?.categoryId ?? ""}
            required
            className={fieldStyles}
          >
            <option value="" disabled>
              Seçin
            </option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="mb-1 block text-xs uppercase tracking-wide text-zinc-500">
            Görsel URL (Phase E.2: Vercel Blob)
          </span>
          <input
            name="imageUrl"
            type="url"
            defaultValue={product?.imageUrl}
            placeholder="https://…"
            className={fieldStyles}
          />
        </label>
      </div>

      <label className="block">
        <span className="mb-1 block text-xs uppercase tracking-wide text-zinc-500">
          Açıklama
        </span>
        <textarea
          name="description"
          rows={4}
          defaultValue={product?.description}
          className={fieldStyles}
        />
      </label>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
        <label className="block">
          <span className="mb-1 block text-xs uppercase tracking-wide text-zinc-500">
            Orijinal Fiyat (TL)
          </span>
          <input
            name="originalPrice"
            type="number"
            step="0.01"
            required
            defaultValue={product?.originalPrice}
            className={fieldStyles + " tabular-nums"}
          />
        </label>
        <label className="block">
          <span className="mb-1 block text-xs uppercase tracking-wide text-zinc-500">
            Satış Fiyatı (TL)
          </span>
          <input
            name="salePrice"
            type="number"
            step="0.01"
            required
            defaultValue={product?.salePrice}
            className={fieldStyles + " tabular-nums"}
          />
        </label>
        <label className="block">
          <span className="mb-1 block text-xs uppercase tracking-wide text-zinc-500">
            Stok
          </span>
          <input
            name="stock"
            type="number"
            min={0}
            required
            defaultValue={product?.stock ?? 0}
            className={fieldStyles + " tabular-nums"}
          />
        </label>
      </div>

      <fieldset className="rounded-lg border border-zinc-200 p-4 dark:border-zinc-800">
        <legend className="px-2 text-xs uppercase tracking-wide text-zinc-500">
          Mobilya Detayları
        </legend>
        <div className="grid grid-cols-3 gap-3">
          <label className="block">
            <span className="mb-1 block text-[10px] uppercase tracking-wide text-zinc-500">
              Genişlik (cm)
            </span>
            <input
              name="widthCm"
              type="number"
              min={0}
              defaultValue={product?.widthCm ?? ""}
              className={fieldStyles + " tabular-nums"}
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-[10px] uppercase tracking-wide text-zinc-500">
              Derinlik (cm)
            </span>
            <input
              name="depthCm"
              type="number"
              min={0}
              defaultValue={product?.depthCm ?? ""}
              className={fieldStyles + " tabular-nums"}
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-[10px] uppercase tracking-wide text-zinc-500">
              Yükseklik (cm)
            </span>
            <input
              name="heightCm"
              type="number"
              min={0}
              defaultValue={product?.heightCm ?? ""}
              className={fieldStyles + " tabular-nums"}
            />
          </label>
        </div>
        <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-3">
          <label className="block">
            <span className="mb-1 block text-[10px] uppercase tracking-wide text-zinc-500">
              Malzeme (virgülle)
            </span>
            <input
              name="material"
              defaultValue={product?.material.join(", ")}
              placeholder="ahşap, mdf, çelik"
              className={fieldStyles}
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-[10px] uppercase tracking-wide text-zinc-500">
              Renk (virgülle)
            </span>
            <input
              name="color"
              defaultValue={product?.color.join(", ")}
              placeholder="antrasit, krem"
              className={fieldStyles}
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-[10px] uppercase tracking-wide text-zinc-500">
              Mekan
            </span>
            <select
              name="room"
              defaultValue={product?.room ?? ""}
              className={fieldStyles}
            >
              <option value="">—</option>
              <option value="salon">Salon</option>
              <option value="yatak-odasi">Yatak Odası</option>
              <option value="yemek-odasi">Yemek Odası</option>
              <option value="mutfak">Mutfak</option>
              <option value="antre">Antre</option>
              <option value="ofis">Ofis</option>
              <option value="cocuk-odasi">Çocuk Odası</option>
            </select>
          </label>
        </div>
      </fieldset>

      <div className="flex flex-wrap gap-4">
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            name="active"
            defaultChecked={product?.active ?? true}
            className="h-4 w-4 accent-zinc-900"
          />
          Aktif (sitede gösterilsin)
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            name="featured"
            defaultChecked={product?.featured ?? false}
            className="h-4 w-4 accent-zinc-900"
          />
          Öne çıkan
        </label>
      </div>

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={submitting}
          className="rounded-full bg-zinc-900 px-6 py-2.5 text-sm font-semibold text-white hover:bg-zinc-800 disabled:opacity-60 dark:bg-white dark:text-zinc-900"
        >
          {submitting ? "Kaydediliyor…" : isEdit ? "Güncelle" : "Ürün Ekle"}
        </button>
      </div>
    </form>
  );
}

function numberOrNull(v: FormDataEntryValue | null): number | null {
  if (v === null || v === "") return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

function splitList(v: FormDataEntryValue | null): string[] {
  if (!v) return [];
  return String(v)
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
}
