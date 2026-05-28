"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { toast } from "sonner";
import {
  Star,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Upload,
} from "lucide-react";

interface ProductImage {
  id: string;
  url: string;
  altText: string;
  isMain: boolean;
  displayOrder: number;
}

interface ProductGalleryManagerProps {
  productId: string;
  initialImages: ProductImage[];
}

// Multi-image gallery editor used on product edit page. Each tile shows
// the image + 4 controls: set-main (star), reorder left/right, delete.
// Upload tile at the end opens the file picker → /api/admin/upload →
// POST /api/admin/products/[id]/images. Server-side ensures isMain
// invariant (single main per product).

export function ProductGalleryManager({
  productId,
  initialImages,
}: ProductGalleryManagerProps) {
  const router = useRouter();
  const [images, setImages] = useState(initialImages);
  const [uploading, setUploading] = useState(false);

  async function refresh() {
    const res = await fetch(`/api/admin/products/${productId}/images`);
    if (!res.ok) return;
    const data = (await res.json()) as { images: ProductImage[] };
    setImages(data.images);
    router.refresh();
  }

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);

    const fd = new FormData();
    fd.append("file", file);
    fd.append("folder", "products");
    fd.append("filename", productId);
    const up = await fetch("/api/admin/upload", { method: "POST", body: fd });
    if (!up.ok) {
      setUploading(false);
      const err = await up.json().catch(() => ({}));
      toast.error(err.error ?? "Yükleme başarısız");
      return;
    }
    const { url } = (await up.json()) as { url: string };
    const add = await fetch(`/api/admin/products/${productId}/images`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url }),
    });
    setUploading(false);
    e.target.value = "";
    if (!add.ok) {
      toast.error("Görsel eklenemedi");
      return;
    }
    toast.success("Görsel eklendi");
    refresh();
  }

  async function handleSetMain(imageId: string) {
    const res = await fetch(
      `/api/admin/products/${productId}/images/${imageId}`,
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isMain: true }),
      },
    );
    if (!res.ok) {
      toast.error("Güncellenemedi");
      return;
    }
    toast.success("Ana görsel ayarlandı");
    refresh();
  }

  async function handleDelete(imageId: string) {
    if (!confirm("Görsel silinsin mi?")) return;
    const res = await fetch(
      `/api/admin/products/${productId}/images/${imageId}`,
      { method: "DELETE" },
    );
    if (!res.ok) {
      toast.error("Silinemedi");
      return;
    }
    toast.success("Görsel silindi");
    refresh();
  }

  async function handleMove(imageId: string, direction: "left" | "right") {
    const idx = images.findIndex((img) => img.id === imageId);
    const otherIdx = direction === "left" ? idx - 1 : idx + 1;
    if (idx < 0 || otherIdx < 0 || otherIdx >= images.length) return;
    const a = images[idx];
    const b = images[otherIdx];
    await Promise.all([
      fetch(`/api/admin/products/${productId}/images/${a.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ displayOrder: b.displayOrder }),
      }),
      fetch(`/api/admin/products/${productId}/images/${b.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ displayOrder: a.displayOrder }),
      }),
    ]);
    refresh();
  }

  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
      <header className="mb-3 flex items-baseline justify-between">
        <p className="text-sm font-semibold">Ürün Görselleri</p>
        <p className="text-[10px] text-zinc-500">
          {images.length} görsel · ana yıldızla işaretli
        </p>
      </header>

      <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
        {images.map((img, i) => (
          <li
            key={img.id}
            className="group relative aspect-[4/5] overflow-hidden rounded-lg border border-zinc-200 bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-800"
          >
            <Image
              src={img.url}
              alt={img.altText}
              fill
              sizes="200px"
              className="object-cover"
            />
            {img.isMain ? (
              <span className="absolute left-2 top-2 rounded-full bg-amber-400 px-2 py-0.5 text-[10px] font-semibold text-zinc-900">
                <Star className="-mt-0.5 mr-0.5 inline h-3 w-3 fill-current" /> Ana
              </span>
            ) : null}
            <div className="absolute inset-x-1 bottom-1 flex items-center justify-between gap-1 opacity-0 transition-opacity group-hover:opacity-100">
              <div className="flex gap-1">
                <button
                  type="button"
                  onClick={() => handleMove(img.id, "left")}
                  disabled={i === 0}
                  className="flex h-7 w-7 items-center justify-center rounded-full bg-black/70 text-white disabled:opacity-30"
                  aria-label="Sola"
                >
                  <ChevronLeft className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => handleMove(img.id, "right")}
                  disabled={i === images.length - 1}
                  className="flex h-7 w-7 items-center justify-center rounded-full bg-black/70 text-white disabled:opacity-30"
                  aria-label="Sağa"
                >
                  <ChevronRight className="h-3.5 w-3.5" />
                </button>
              </div>
              <div className="flex gap-1">
                {!img.isMain ? (
                  <button
                    type="button"
                    onClick={() => handleSetMain(img.id)}
                    className="flex h-7 w-7 items-center justify-center rounded-full bg-black/70 text-amber-300 hover:bg-black/85"
                    aria-label="Ana yap"
                  >
                    <Star className="h-3.5 w-3.5" />
                  </button>
                ) : null}
                <button
                  type="button"
                  onClick={() => handleDelete(img.id)}
                  className="flex h-7 w-7 items-center justify-center rounded-full bg-black/70 text-red-300 hover:bg-black/85"
                  aria-label="Sil"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </li>
        ))}

        <li className="aspect-[4/5]">
          <label className="flex h-full w-full cursor-pointer flex-col items-center justify-center gap-1 rounded-lg border-2 border-dashed border-zinc-300 text-xs text-zinc-500 transition-colors hover:border-zinc-500 hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-800">
            <Upload className="h-5 w-5" />
            <span className="font-medium">
              {uploading ? "Yükleniyor…" : "Görsel ekle"}
            </span>
            <span className="text-[10px] text-zinc-400">JPG/PNG, ≤5MB</span>
            <input
              type="file"
              accept="image/*"
              className="sr-only"
              onChange={handleUpload}
              disabled={uploading}
            />
          </label>
        </li>
      </ul>
    </div>
  );
}
