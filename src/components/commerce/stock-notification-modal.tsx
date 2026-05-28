"use client";

import { useState } from "react";
import { Bell } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

interface StockNotificationModalProps {
  productId: string;
  productName: string;
}

const fieldStyles =
  "w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-ink placeholder:text-ink-faint focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20";

// Renders a "Stok geldiğinde haber ver" trigger button + a modal with an
// e-mail or phone form. Writes to StockNotification table via the public
// endpoint. Replaces the deafening blank "Stokta Yok" experience that loses
// high-consideration buyers (Phase 2 review T19).

export function StockNotificationModal({
  productId,
  productName,
}: StockNotificationModalProps) {
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const email = String(fd.get("email") ?? "").trim();
    const phone = String(fd.get("phone") ?? "").trim();
    if (!email && !phone) {
      toast.error("En az bir iletişim bilgisi gerekli");
      return;
    }

    setSubmitting(true);
    const res = await fetch("/api/stock-notifications", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId, email, phone }),
    });
    setSubmitting(false);

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      toast.error(err.error ?? "Kaydedilemedi");
      return;
    }
    setSent(true);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <button
        onClick={() => setOpen(true)}
        className={cn(
          "inline-flex h-12 items-center justify-center gap-2 rounded-full border border-border bg-background px-6 text-sm font-semibold text-ink transition-colors hover:bg-surface-2",
        )}
      >
        <Bell className="h-4 w-4" />
        Stok Bildirimi
      </button>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Stok geldiğinde haber al</DialogTitle>
          <DialogDescription>
            {productName} tekrar stokta olunca size ulaşalım.
          </DialogDescription>
        </DialogHeader>

        {sent ? (
          <div className="space-y-3 py-2">
            <p className="rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-900 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-200">
              ✓ Kaydedildi. Stok geldiğinde size ulaşacağız.
            </p>
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                setTimeout(() => setSent(false), 300);
              }}
              className="w-full rounded-full border border-border py-2.5 text-sm hover:bg-surface-2"
            >
              Kapat
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <label className="block">
              <span className="mb-1.5 block text-xs uppercase tracking-wide text-ink-muted">
                E-posta
              </span>
              <input
                type="email"
                name="email"
                autoComplete="email"
                placeholder="ornek@email.com"
                className={fieldStyles}
              />
            </label>
            <p className="text-center text-xs text-ink-faint">veya</p>
            <label className="block">
              <span className="mb-1.5 block text-xs uppercase tracking-wide text-ink-muted">
                Telefon (WhatsApp)
              </span>
              <input
                type="tel"
                name="phone"
                autoComplete="tel"
                inputMode="tel"
                placeholder="+90 5xx xxx xx xx"
                className={fieldStyles}
              />
            </label>
            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-full bg-brand py-3 text-sm font-semibold text-white hover:bg-brand/90 disabled:opacity-60"
            >
              {submitting ? "Kaydediliyor…" : "Bildirim Al"}
            </button>
            <p className="text-center text-[10px] text-ink-faint">
              KVKK kapsamında sadece bu bildirim için saklanır.
            </p>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
