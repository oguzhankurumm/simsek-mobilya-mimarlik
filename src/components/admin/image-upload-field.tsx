"use client";

import { useState } from "react";
import Image from "next/image";
import { Upload, Trash2, Link as LinkIcon, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface ImageUploadFieldProps {
  /** Form field name — its value is the final URL passed to the parent submit. */
  name: string;
  /** Vercel Blob `folder` parameter — keeps blobs sorted by entity type. */
  folder: string;
  defaultValue?: string;
  /** Optional human label rendered above the picker. */
  label?: string;
  /** Optional filename hint for the uploaded blob. */
  filename?: string;
}

// Form-friendly image uploader. The actual <input name=...> is hidden but
// participates in the parent form's FormData, so existing form submit paths
// (ProductForm etc.) keep working without changes — they just receive a
// Vercel Blob URL instead of a manually-typed URL. Falls back to "paste a
// URL" mode if Blob upload is unavailable.

export function ImageUploadField({
  name,
  folder,
  defaultValue = "",
  label,
  filename,
}: ImageUploadFieldProps) {
  const [url, setUrl] = useState(defaultValue);
  const [uploading, setUploading] = useState(false);
  const [showUrlInput, setShowUrlInput] = useState(false);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);

    const form = new FormData();
    form.append("file", file);
    form.append("folder", folder);
    if (filename) form.append("filename", filename);

    try {
      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: form,
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        toast.error(err.error ?? "Yükleme başarısız");
        return;
      }
      const { url: blobUrl } = (await res.json()) as { url: string };
      setUrl(blobUrl);
      toast.success("Görsel yüklendi");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }

  return (
    <div className="space-y-2">
      {label ? (
        <span className="block text-xs uppercase tracking-wide text-zinc-500">
          {label}
        </span>
      ) : null}

      <input type="hidden" name={name} value={url} />

      {url ? (
        <div className="space-y-2">
          <div className="relative h-40 w-full overflow-hidden rounded-lg border border-zinc-200 bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-800">
            <Image
              src={url}
              alt=""
              fill
              sizes="(min-width: 768px) 400px, 100vw"
              className="object-contain"
            />
          </div>
          <div className="flex items-center justify-between gap-2 text-xs">
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-zinc-600 hover:text-zinc-900 dark:text-zinc-400"
            >
              <ExternalLink className="h-3 w-3" /> Tam boyut
            </a>
            <button
              type="button"
              onClick={() => setUrl("")}
              className="inline-flex items-center gap-1 text-red-600 hover:text-red-700"
            >
              <Trash2 className="h-3 w-3" /> Kaldır
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-2">
          <label
            className={cn(
              "flex cursor-pointer flex-col items-center justify-center gap-1 rounded-lg border-2 border-dashed border-zinc-300 px-4 py-6 text-xs text-zinc-600 transition-colors hover:border-zinc-500 dark:border-zinc-700 dark:text-zinc-400",
              uploading && "cursor-wait opacity-60",
            )}
          >
            <Upload className="h-5 w-5" />
            <span className="font-medium">
              {uploading ? "Yükleniyor…" : "Görseli sürükle veya seç"}
            </span>
            <span className="text-[10px] text-zinc-400">
              JPG / PNG / WebP, ≤5MB
            </span>
            <input
              type="file"
              accept="image/*"
              className="sr-only"
              disabled={uploading}
              onChange={handleFile}
            />
          </label>

          {showUrlInput ? (
            <input
              type="url"
              placeholder="https://…"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
            />
          ) : (
            <button
              type="button"
              onClick={() => setShowUrlInput(true)}
              className="inline-flex items-center gap-1 text-[10px] text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-300"
            >
              <LinkIcon className="h-3 w-3" /> ya da URL yapıştır
            </button>
          )}
        </div>
      )}
    </div>
  );
}
