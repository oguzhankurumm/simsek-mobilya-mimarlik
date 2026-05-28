"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Upload, CheckCircle2, AlertTriangle } from "lucide-react";

interface ImportResult {
  total: number;
  created: number;
  updated: number;
  errors: { row: number; message: string }[];
}

export function CsvImportClient() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!file) {
      toast.error("Önce bir CSV dosyası seçin");
      return;
    }
    setBusy(true);
    setResult(null);

    const fd = new FormData();
    fd.append("file", file);
    const res = await fetch("/api/admin/products/import", {
      method: "POST",
      body: fd,
    });
    setBusy(false);
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      toast.error(err.error ?? "İçe aktarma başarısız");
      return;
    }
    const data = (await res.json()) as ImportResult;
    setResult(data);
    toast.success(
      `${data.created} yeni, ${data.updated} güncel · ${data.errors.length} hata`,
    );
    router.refresh();
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900"
    >
      <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-zinc-300 px-4 py-8 text-sm text-zinc-600 transition-colors hover:border-zinc-500 dark:border-zinc-700 dark:text-zinc-400">
        <Upload className="h-6 w-6" />
        {file ? (
          <span className="font-medium">{file.name}</span>
        ) : (
          <>
            <span className="font-medium">CSV dosyası seç</span>
            <span className="text-[10px] text-zinc-400">≤2MB, 500 satır</span>
          </>
        )}
        <input
          type="file"
          accept=".csv,text/csv"
          className="sr-only"
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          disabled={busy}
        />
      </label>
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={busy || !file}
          className="rounded-full bg-zinc-900 px-6 py-2.5 text-sm font-semibold text-white hover:bg-zinc-800 disabled:opacity-60 dark:bg-white dark:text-zinc-900"
        >
          {busy ? "Yükleniyor…" : "İçe Aktar"}
        </button>
      </div>

      {result ? (
        <div className="space-y-3 rounded-lg border border-zinc-200 bg-zinc-50 p-4 text-sm dark:border-zinc-800 dark:bg-zinc-950">
          <div className="flex gap-4">
            <div>
              <p className="text-[10px] uppercase tracking-widest text-zinc-500">
                Toplam
              </p>
              <p className="text-xl font-semibold tabular-nums">
                {result.total}
              </p>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-widest text-zinc-500">
                Yeni
              </p>
              <p className="text-xl font-semibold tabular-nums text-emerald-700">
                {result.created}
              </p>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-widest text-zinc-500">
                Güncel
              </p>
              <p className="text-xl font-semibold tabular-nums text-blue-700">
                {result.updated}
              </p>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-widest text-zinc-500">
                Hata
              </p>
              <p className="text-xl font-semibold tabular-nums text-red-700">
                {result.errors.length}
              </p>
            </div>
          </div>

          {result.errors.length === 0 ? (
            <p className="flex items-center gap-2 text-xs text-emerald-700">
              <CheckCircle2 className="h-3.5 w-3.5" /> Tüm satırlar başarıyla işlendi.
            </p>
          ) : (
            <details>
              <summary className="cursor-pointer text-xs text-red-700">
                <AlertTriangle className="mr-1 inline h-3.5 w-3.5" />
                {result.errors.length} satır hatalı (göster)
              </summary>
              <ul className="mt-2 max-h-60 overflow-y-auto rounded border border-zinc-200 bg-white text-xs dark:border-zinc-800 dark:bg-zinc-900">
                {result.errors.map((err, i) => (
                  <li
                    key={i}
                    className="flex gap-2 border-b border-zinc-100 px-3 py-1.5 last:border-0 dark:border-zinc-800"
                  >
                    <span className="font-mono text-zinc-500">satır {err.row}</span>
                    <span>{err.message}</span>
                  </li>
                ))}
              </ul>
            </details>
          )}
        </div>
      ) : null}
    </form>
  );
}
