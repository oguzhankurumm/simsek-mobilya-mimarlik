"use client";

import { useEffect, useState } from "react";
import { Download, X } from "lucide-react";
import { cn } from "@/lib/utils";

// PWA install prompt. Browser fires beforeinstallprompt only when the site
// meets installability criteria (manifest + service worker would normally be
// required, but Chromium 117+ relaxes that for partial PWAs). We delay the
// banner until the user has seen the site at least 3 times AND dismissed
// nothing else recently — same pattern daf-yapi acknowledged in Failure
// Mode F7.

const VISITS_KEY = "simsek-visits";
const DISMISSED_KEY = "simsek-pwa-dismissed-until";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export function InstallPrompt() {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(
    null,
  );
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    // Already installed → don't show.
    if (window.matchMedia("(display-mode: standalone)").matches) return;

    // Bump visit count.
    const visits = Number(localStorage.getItem(VISITS_KEY) ?? "0") + 1;
    localStorage.setItem(VISITS_KEY, String(visits));

    // Honour 30-day dismissal window (T22 review).
    const dismissedUntil = Number(
      localStorage.getItem(DISMISSED_KEY) ?? "0",
    );
    if (dismissedUntil > Date.now()) return;

    const onBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferred(e as BeforeInstallPromptEvent);
      if (visits >= 3) setVisible(true);
    };

    window.addEventListener("beforeinstallprompt", onBeforeInstall);
    return () =>
      window.removeEventListener("beforeinstallprompt", onBeforeInstall);
  }, []);

  function dismiss() {
    setVisible(false);
    const thirtyDays = 30 * 24 * 60 * 60 * 1000;
    localStorage.setItem(DISMISSED_KEY, String(Date.now() + thirtyDays));
  }

  async function install() {
    if (!deferred) return;
    await deferred.prompt();
    const choice = await deferred.userChoice;
    if (choice.outcome === "accepted") {
      setVisible(false);
    } else {
      dismiss();
    }
  }

  if (!visible) return null;

  return (
    <div
      className={cn(
        "fixed left-3 right-3 z-30 rounded-2xl border border-border bg-background/95 backdrop-blur-xl backdrop-saturate-150 shadow-xl",
        "bottom-[calc(env(safe-area-inset-bottom)+72px)] md:left-auto md:right-6 md:max-w-sm md:bottom-6",
      )}
      role="dialog"
      aria-label="Uygulamayı yükle"
    >
      <div className="flex items-start gap-3 p-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand text-white">
          <Download className="h-5 w-5" />
        </div>
        <div className="flex-1 space-y-1">
          <p className="text-sm font-semibold">Şimşek Mobilya uygulaması</p>
          <p className="text-xs text-ink-muted">
            Ana ekrana ekleyin, daha hızlı erişin.
          </p>
          <div className="mt-2 flex gap-2">
            <button
              onClick={install}
              className="rounded-full bg-brand px-4 py-1.5 text-xs font-semibold text-white hover:bg-brand/90"
            >
              Yükle
            </button>
            <button
              onClick={dismiss}
              className="rounded-full border border-border px-3 py-1.5 text-xs text-ink-muted hover:bg-surface-2"
            >
              Sonra
            </button>
          </div>
        </div>
        <button
          onClick={dismiss}
          className="text-ink-faint hover:text-ink"
          aria-label="Kapat"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
