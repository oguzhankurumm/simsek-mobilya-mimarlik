"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface SettingsFormProps {
  initialValues: {
    siteName: string;
    metaDescription: string;
    whatsappFloatNumber: string;
    freeShippingThreshold: number;
    maintenanceMode: boolean;
    vkn: string;
    mersisNo: string;
    etbisNo: string;
    legalAddress: string;
  };
}

const fieldStyles =
  "w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900";

export function SettingsForm({ initialValues }: SettingsFormProps) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    const fd = new FormData(e.currentTarget);
    const body = {
      siteName: String(fd.get("siteName") ?? ""),
      metaDescription: String(fd.get("metaDescription") ?? ""),
      whatsappFloatNumber: String(fd.get("whatsappFloatNumber") ?? ""),
      freeShippingThreshold: Number(fd.get("freeShippingThreshold") ?? 0),
      maintenanceMode: fd.get("maintenanceMode") === "on",
      vkn: String(fd.get("vkn") ?? ""),
      mersisNo: String(fd.get("mersisNo") ?? ""),
      etbisNo: String(fd.get("etbisNo") ?? ""),
      legalAddress: String(fd.get("legalAddress") ?? ""),
    };
    const res = await fetch("/api/admin/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    setSubmitting(false);
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      toast.error(err.error ?? "Kaydedilemedi");
      return;
    }
    toast.success("Ayarlar güncellendi");
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="max-w-3xl space-y-6">
      <fieldset className="space-y-4 rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
        <legend className="px-2 text-xs uppercase tracking-wide text-zinc-500">
          Genel
        </legend>
        <label className="block">
          <span className="mb-1 block text-xs uppercase tracking-wide text-zinc-500">
            Site Adı
          </span>
          <input
            name="siteName"
            defaultValue={initialValues.siteName}
            className={fieldStyles}
          />
        </label>
        <label className="block">
          <span className="mb-1 block text-xs uppercase tracking-wide text-zinc-500">
            Meta Description
          </span>
          <textarea
            name="metaDescription"
            rows={2}
            defaultValue={initialValues.metaDescription}
            className={fieldStyles}
          />
        </label>
        <div className="grid grid-cols-2 gap-3">
          <label className="block">
            <span className="mb-1 block text-xs uppercase tracking-wide text-zinc-500">
              WhatsApp Hattı (E.164)
            </span>
            <input
              name="whatsappFloatNumber"
              defaultValue={initialValues.whatsappFloatNumber}
              placeholder="+905326463919"
              className={fieldStyles}
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-xs uppercase tracking-wide text-zinc-500">
              Ücretsiz Kargo Eşiği (TL)
            </span>
            <input
              type="number"
              step="0.01"
              name="freeShippingThreshold"
              defaultValue={initialValues.freeShippingThreshold}
              className={fieldStyles + " tabular-nums"}
            />
          </label>
        </div>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            name="maintenanceMode"
            defaultChecked={initialValues.maintenanceMode}
            className="h-4 w-4 accent-zinc-900"
          />
          <span>Bakım modu (yalnızca admin erişimi)</span>
        </label>
      </fieldset>

      <fieldset className="space-y-4 rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
        <legend className="px-2 text-xs uppercase tracking-wide text-zinc-500">
          Yasal Bilgi (P11)
        </legend>
        <div className="grid grid-cols-3 gap-3">
          <label className="block">
            <span className="mb-1 block text-xs uppercase tracking-wide text-zinc-500">
              VKN
            </span>
            <input
              name="vkn"
              defaultValue={initialValues.vkn}
              className={fieldStyles + " tabular-nums"}
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-xs uppercase tracking-wide text-zinc-500">
              MERSIS No
            </span>
            <input
              name="mersisNo"
              defaultValue={initialValues.mersisNo}
              className={fieldStyles + " tabular-nums"}
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-xs uppercase tracking-wide text-zinc-500">
              ETBİS No
            </span>
            <input
              name="etbisNo"
              defaultValue={initialValues.etbisNo}
              className={fieldStyles + " tabular-nums"}
            />
          </label>
        </div>
        <label className="block">
          <span className="mb-1 block text-xs uppercase tracking-wide text-zinc-500">
            Yasal Adres
          </span>
          <textarea
            name="legalAddress"
            rows={2}
            defaultValue={initialValues.legalAddress}
            className={fieldStyles}
          />
        </label>
      </fieldset>

      <button
        type="submit"
        disabled={submitting}
        className="rounded-full bg-zinc-900 px-6 py-2.5 text-sm font-semibold text-white hover:bg-zinc-800 disabled:opacity-60 dark:bg-white dark:text-zinc-900"
      >
        {submitting ? "Kaydediliyor…" : "Ayarları Kaydet"}
      </button>
    </form>
  );
}
