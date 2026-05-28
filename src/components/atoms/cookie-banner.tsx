"use client";

import { useEffect, useState } from "react";
import { useLocale } from "next-intl";
import { X, Cookie } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

// KVKK-compliant cookie consent. Three categories per Türkiye's 6698 sayılı
// KVKK + e-ticaret mevzuatı:
//   - Zorunlu (functional): site oturumu, sepet, dil tercihi. Vazgeçilemez.
//   - Analitik: Vercel Analytics + Speed Insights, ziyaret istatistikleri.
//   - Pazarlama: gelecekte remarketing / sosyal medya pixel'leri.
//
// The choice is persisted to localStorage AND a cookie (so server-side
// analytics integrations can read it on first request). Banner re-opens
// when the schema version changes (CONSENT_VERSION bump).

type CategoryKey = "necessary" | "analytics" | "marketing";

const STORAGE_KEY = "simsek-cookie-consent";
const CONSENT_VERSION = 2;

interface Consent {
  version: number;
  necessary: boolean;
  analytics: boolean;
  marketing: boolean;
  decidedAt: string;
}

const DEFAULTS: Omit<Consent, "decidedAt"> = {
  version: CONSENT_VERSION,
  necessary: true,
  analytics: false,
  marketing: false,
};

function loadConsent(): Consent | null {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Consent;
    if (parsed?.version !== CONSENT_VERSION) return null;
    return parsed;
  } catch {
    return null;
  }
}

function persistConsent(c: Consent) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(c));
  } catch {
    /* private mode — silent */
  }
  // Mirror to a non-httpOnly cookie so SSR / edge can read it. 1-year TTL,
  // SameSite=Lax matches our auth cookie defaults.
  const yearSeconds = 60 * 60 * 24 * 365;
  document.cookie = `simsek-cc=${encodeURIComponent(
    JSON.stringify({ a: c.analytics ? 1 : 0, m: c.marketing ? 1 : 0 }),
  )}; max-age=${yearSeconds}; path=/; SameSite=Lax`;
}

export function CookieBanner() {
  const locale = useLocale();
  const isTr = locale === "tr";
  const [show, setShow] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [analytics, setAnalytics] = useState(false);
  const [marketing, setMarketing] = useState(false);

  useEffect(() => {
    const existing = loadConsent();
    if (!existing) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setShow(true);
      return;
    }
    setAnalytics(existing.analytics);
    setMarketing(existing.marketing);
  }, []);

  function saveAll(consent: Omit<Consent, "decidedAt">) {
    const c: Consent = { ...consent, decidedAt: new Date().toISOString() };
    persistConsent(c);
    setShow(false);
  }

  function acceptAll() {
    saveAll({
      version: CONSENT_VERSION,
      necessary: true,
      analytics: true,
      marketing: true,
    });
  }
  function rejectOptional() {
    saveAll({ ...DEFAULTS });
  }
  function saveCustom() {
    saveAll({
      version: CONSENT_VERSION,
      necessary: true,
      analytics,
      marketing,
    });
  }

  if (!show) return null;

  const labels = isTr
    ? {
        title: "Çerez Tercihleri",
        body: "Site deneyimini iyileştirmek için çerez kullanıyoruz. Zorunlu çerezler hizmetin çalışması için gereklidir; analitik ve pazarlama çerezleri opsiyoneldir.",
        details: "Çerez kategorilerini incele",
        learnMore: "KVKK Aydınlatma Metni",
        acceptAll: "Tümünü Kabul Et",
        rejectOptional: "Sadece Zorunlu",
        saveSelection: "Seçimi Kaydet",
        cats: {
          necessary: {
            title: "Zorunlu Çerezler",
            desc: "Oturum, sepet, dil tercihi gibi temel işlevler için gerekli. Reddedilemez.",
          },
          analytics: {
            title: "Analitik Çerezler",
            desc: "Vercel Analytics + Speed Insights. Ziyaretçi sayısı, sayfa performansı.",
          },
          marketing: {
            title: "Pazarlama Çerezleri",
            desc: "Sosyal medya entegrasyonları + remarketing (şu an aktif değil; ileride eklenebilir).",
          },
        },
        close: "Kapat",
      }
    : {
        title: "Cookie Preferences",
        body: "We use cookies to improve site experience. Strictly necessary cookies are required for the service; analytics and marketing are optional.",
        details: "Review cookie categories",
        learnMore: "Privacy Notice",
        acceptAll: "Accept All",
        rejectOptional: "Necessary Only",
        saveSelection: "Save Selection",
        cats: {
          necessary: {
            title: "Necessary",
            desc: "Session, cart, language preference. Cannot be disabled.",
          },
          analytics: {
            title: "Analytics",
            desc: "Vercel Analytics + Speed Insights. Visitor counts, page performance.",
          },
          marketing: {
            title: "Marketing",
            desc: "Social integrations + remarketing (not currently used).",
          },
        },
        close: "Close",
      };

  return (
    <div
      role="dialog"
      aria-live="polite"
      aria-label={labels.title}
      className={cn(
        "fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-[28rem] z-50",
        "pb-[env(safe-area-inset-bottom)]",
        "rounded-2xl border border-border bg-background/95 backdrop-blur-md p-5",
        "shadow-elevated animate-in slide-in-from-bottom-4 fade-in duration-500",
      )}
    >
      <div className="flex items-start gap-3">
        <Cookie
          className="mt-0.5 h-5 w-5 shrink-0 text-brand"
          strokeWidth={1.75}
        />
        <div className="flex-1">
          <p className="text-sm font-semibold text-ink">{labels.title}</p>
          <p className="mt-1 text-xs leading-relaxed text-ink-muted">
            {labels.body}{" "}
            <Link
              href="/privacy"
              className="text-brand underline-offset-2 hover:underline"
            >
              {labels.learnMore}
            </Link>
            .
          </p>

          {showDetails ? (
            <ul className="mt-3 space-y-2 text-xs">
              {(["necessary", "analytics", "marketing"] as CategoryKey[]).map(
                (cat) => {
                  const meta = labels.cats[cat];
                  const disabled = cat === "necessary";
                  const checked =
                    cat === "necessary"
                      ? true
                      : cat === "analytics"
                        ? analytics
                        : marketing;
                  const onChange = () => {
                    if (cat === "analytics") setAnalytics((v) => !v);
                    if (cat === "marketing") setMarketing((v) => !v);
                  };
                  return (
                    <li
                      key={cat}
                      className="flex items-start gap-2 rounded-lg border border-border bg-surface-2/40 px-3 py-2"
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={onChange}
                        disabled={disabled}
                        className="mt-0.5 h-3.5 w-3.5 accent-brand disabled:opacity-60"
                      />
                      <div className="flex-1">
                        <p className="font-medium text-ink">{meta.title}</p>
                        <p className="text-ink-muted">{meta.desc}</p>
                      </div>
                    </li>
                  );
                },
              )}
            </ul>
          ) : (
            <button
              type="button"
              onClick={() => setShowDetails(true)}
              className="mt-2 text-xs text-ink-muted underline-offset-2 hover:text-brand hover:underline"
            >
              {labels.details}
            </button>
          )}

          <div className="mt-3 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={acceptAll}
              className="rounded-full bg-ink px-4 py-2 text-xs font-semibold text-background hover:bg-ink/85"
            >
              {labels.acceptAll}
            </button>
            {showDetails ? (
              <button
                type="button"
                onClick={saveCustom}
                className="rounded-full border border-border bg-background px-4 py-2 text-xs font-semibold hover:bg-surface-2"
              >
                {labels.saveSelection}
              </button>
            ) : null}
            <button
              type="button"
              onClick={rejectOptional}
              className="rounded-full px-4 py-2 text-xs text-ink-muted hover:text-ink"
            >
              {labels.rejectOptional}
            </button>
          </div>
        </div>
        <button
          type="button"
          onClick={rejectOptional}
          aria-label={labels.close}
          className="-mt-1 -mr-1 p-1 text-ink-faint transition-colors hover:text-ink"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
