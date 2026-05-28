"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface ProfileFormProps {
  initial: { name: string; email: string; phone: string | null };
}

const fieldStyles =
  "w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-ink placeholder:text-ink-faint focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20";

export function ProfileForm({ initial }: ProfileFormProps) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [pwSaving, setPwSaving] = useState(false);

  async function onProfile(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    const fd = new FormData(e.currentTarget);
    const res = await fetch("/api/user/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: String(fd.get("name") ?? ""),
        phone: String(fd.get("phone") ?? ""),
      }),
    });
    setSaving(false);
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      toast.error(err.error ?? "Kaydedilemedi");
      return;
    }
    toast.success("Profil güncellendi");
    router.refresh();
  }

  async function onPassword(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPwSaving(true);
    const fd = new FormData(e.currentTarget);
    const newPassword = String(fd.get("newPassword") ?? "");
    const confirmPassword = String(fd.get("confirmPassword") ?? "");
    if (newPassword !== confirmPassword) {
      toast.error("Yeni şifre tekrarı eşleşmiyor");
      setPwSaving(false);
      return;
    }
    const res = await fetch("/api/user/profile", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        currentPassword: String(fd.get("currentPassword") ?? ""),
        newPassword,
      }),
    });
    setPwSaving(false);
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      toast.error(err.error ?? "Şifre değiştirilemedi");
      return;
    }
    toast.success("Şifre güncellendi");
    (e.target as HTMLFormElement).reset();
  }

  return (
    <div className="space-y-8">
      <form onSubmit={onProfile} className="space-y-4">
        <header>
          <h3 className="text-sm font-semibold">İletişim Bilgileri</h3>
          <p className="mt-0.5 text-xs text-ink-muted">
            E-posta değişikliği destek üzerinden yapılır.
          </p>
        </header>
        <label className="block">
          <span className="mb-1.5 block text-xs uppercase tracking-wide text-ink-muted">
            Ad Soyad
          </span>
          <input
            name="name"
            defaultValue={initial.name}
            className={fieldStyles}
            required
          />
        </label>
        <label className="block">
          <span className="mb-1.5 block text-xs uppercase tracking-wide text-ink-muted">
            E-posta
          </span>
          <input
            value={initial.email}
            disabled
            className={`${fieldStyles} cursor-not-allowed opacity-70`}
          />
        </label>
        <label className="block">
          <span className="mb-1.5 block text-xs uppercase tracking-wide text-ink-muted">
            Telefon
          </span>
          <input
            type="tel"
            inputMode="tel"
            name="phone"
            defaultValue={initial.phone ?? ""}
            placeholder="+90 5xx xxx xx xx"
            className={fieldStyles}
          />
        </label>
        <button
          type="submit"
          disabled={saving}
          className="rounded-full bg-brand px-5 py-2.5 text-xs font-semibold text-white hover:bg-brand/90 disabled:opacity-60"
        >
          {saving ? "Kaydediliyor…" : "Profili Kaydet"}
        </button>
      </form>

      <form onSubmit={onPassword} className="space-y-4 border-t border-border pt-6">
        <header>
          <h3 className="text-sm font-semibold">Şifre Değiştir</h3>
          <p className="mt-0.5 text-xs text-ink-muted">
            Değiştirdiğinizde diğer cihazlardaki oturumlar kapatılır.
          </p>
        </header>
        <label className="block">
          <span className="mb-1.5 block text-xs uppercase tracking-wide text-ink-muted">
            Mevcut Şifre
          </span>
          <input
            type="password"
            name="currentPassword"
            autoComplete="current-password"
            className={fieldStyles}
            required
          />
        </label>
        <label className="block">
          <span className="mb-1.5 block text-xs uppercase tracking-wide text-ink-muted">
            Yeni Şifre (en az 8 karakter)
          </span>
          <input
            type="password"
            name="newPassword"
            autoComplete="new-password"
            minLength={8}
            className={fieldStyles}
            required
          />
        </label>
        <label className="block">
          <span className="mb-1.5 block text-xs uppercase tracking-wide text-ink-muted">
            Yeni Şifre Tekrar
          </span>
          <input
            type="password"
            name="confirmPassword"
            autoComplete="new-password"
            minLength={8}
            className={fieldStyles}
            required
          />
        </label>
        <button
          type="submit"
          disabled={pwSaving}
          className="rounded-full border border-border bg-background px-5 py-2.5 text-xs font-semibold hover:bg-surface-2 disabled:opacity-60"
        >
          {pwSaving ? "Kaydediliyor…" : "Şifreyi Değiştir"}
        </button>
      </form>
    </div>
  );
}
