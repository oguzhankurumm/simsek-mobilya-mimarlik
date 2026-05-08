"use client";

import { useEffect, useState } from "react";
import { useLocale } from "next-intl";
import { X } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const STORAGE_KEY = "simsek-cookie-consent";

export function CookieBanner() {
  const locale = useLocale();
  const [show, setShow] = useState(false);

  useEffect(() => {
    // Check localStorage. Show only if no decision yet.
    try {
      const v = window.localStorage.getItem(STORAGE_KEY);
      if (!v) {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setShow(true);
      }
    } catch {
      /* SSR/private mode — fail open */
    }
  }, []);

  function dismiss() {
    try {
      window.localStorage.setItem(STORAGE_KEY, "accepted");
    } catch {
      /* private mode */
    }
    setShow(false);
  }

  if (!show) return null;

  const isTr = locale === "tr";

  return (
    <div
      role="dialog"
      aria-live="polite"
      aria-label={isTr ? "Çerez bildirimi" : "Cookie notice"}
      className={cn(
        "fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-[26rem] z-50 pb-safe",
        "rounded-lg border border-border bg-background/95 backdrop-blur-md p-5",
        "shadow-elevated animate-in slide-in-from-bottom-4 fade-in duration-500"
      )}
    >
      <div className="flex items-start gap-3">
        <div className="flex-1">
          <p className="text-sm text-ink leading-relaxed">
            {isTr
              ? "Site deneyimini iyileştirmek ve istatistik toplamak için zorunlu çerezler kullanıyoruz. Detayı "
              : "We use essential and analytics cookies to improve experience. Details in our "}
            <Link
              href="/privacy"
              className="text-brand underline-offset-2 hover:underline"
            >
              {isTr ? "KVKK Aydınlatma Metni" : "Privacy Notice"}
            </Link>
            {isTr ? "'nde." : "."}
          </p>
          <Button
            size="sm"
            onClick={dismiss}
            className="mt-3 rounded-full bg-ink text-background hover:bg-ink/85 h-9 px-4 text-xs"
          >
            {isTr ? "Anladım" : "Got it"}
          </Button>
        </div>
        <button
          type="button"
          onClick={dismiss}
          aria-label={isTr ? "Kapat" : "Close"}
          className="text-ink-faint hover:text-ink transition-colors -mt-1 -mr-1 p-1"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
