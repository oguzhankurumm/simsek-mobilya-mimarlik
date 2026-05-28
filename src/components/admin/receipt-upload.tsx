"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Upload, ExternalLink, Trash2 } from "lucide-react";
import { toast } from "sonner";
import Image from "next/image";

interface ReceiptUploadProps {
  orderNumber: string;
  currentUrl: string | null;
}

// Admin uploads the dekont image to Vercel Blob, then PATCHes the order
// with the returned URL. Used inside /admin/dashboard/orders/[orderNumber]
// when the customer's WhatsApp message includes a screenshot the admin
// wants archived against the order record.

export function ReceiptUpload({
  orderNumber,
  currentUrl,
}: ReceiptUploadProps) {
  const router = useRouter();
  const [uploading, setUploading] = useState(false);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);

    const form = new FormData();
    form.append("file", file);
    form.append("folder", "receipts");
    form.append("filename", orderNumber);

    try {
      const up = await fetch("/api/admin/upload", {
        method: "POST",
        body: form,
      });
      if (!up.ok) {
        const err = await up.json().catch(() => ({}));
        toast.error(err.error ?? "Yükleme başarısız");
        return;
      }
      const { url } = (await up.json()) as { url: string };

      const patch = await fetch(`/api/admin/orders/${orderNumber}/receipt`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ receiptImageUrl: url }),
      });
      if (!patch.ok) {
        toast.error("Dekont siparişe eklenemedi");
        return;
      }
      toast.success("Dekont eklendi");
      router.refresh();
    } finally {
      setUploading(false);
    }
  }

  async function handleRemove() {
    if (!currentUrl) return;
    if (!confirm("Dekont silinsin mi?")) return;
    const patch = await fetch(`/api/admin/orders/${orderNumber}/receipt`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ receiptImageUrl: null }),
    });
    if (!patch.ok) {
      toast.error("Silinemedi");
      return;
    }
    toast.success("Dekont silindi");
    router.refresh();
  }

  if (currentUrl) {
    return (
      <div className="space-y-2">
        <div className="relative h-40 w-full overflow-hidden rounded-lg border border-zinc-200 bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-800">
          <Image
            src={currentUrl}
            alt={`${orderNumber} dekont`}
            fill
            sizes="320px"
            className="object-contain"
          />
        </div>
        <div className="flex items-center justify-between gap-2 text-xs">
          <a
            href={currentUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-zinc-600 hover:text-zinc-900 dark:text-zinc-400"
          >
            <ExternalLink className="h-3 w-3" /> Tam boyut
          </a>
          <button
            onClick={handleRemove}
            className="inline-flex items-center gap-1 text-red-600 hover:text-red-700"
          >
            <Trash2 className="h-3 w-3" /> Kaldır
          </button>
        </div>
      </div>
    );
  }

  return (
    <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-zinc-300 px-4 py-6 text-xs text-zinc-600 hover:border-zinc-500 dark:border-zinc-700 dark:text-zinc-400">
      <Upload className="h-5 w-5" />
      <span>
        {uploading ? "Yükleniyor…" : "Dekont yükle (JPG/PNG, ≤5MB)"}
      </span>
      <input
        type="file"
        accept="image/*"
        className="sr-only"
        disabled={uploading}
        onChange={handleFile}
      />
    </label>
  );
}
