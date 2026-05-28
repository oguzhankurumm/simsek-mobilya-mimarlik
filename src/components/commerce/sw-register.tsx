"use client";

import { useEffect } from "react";

// Registers /sw.js on first idle. We do it client-side rather than relying on
// any auto-registration helper because Next 16 + Turbopack are fussy about
// when the SW manifest is wired. Behind a `serviceWorker in navigator`
// check so SSR + non-supporting browsers no-op safely.

export function SwRegister() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!("serviceWorker" in navigator)) return;
    if (process.env.NODE_ENV !== "production") return;

    const register = () => {
      navigator.serviceWorker
        .register("/sw.js", { scope: "/" })
        .catch(() => {
          // Silent — SW is best-effort, app works without it.
        });
    };

    const ric = (window as Window &
      typeof globalThis & {
        requestIdleCallback?: (cb: () => void) => void;
      }).requestIdleCallback;
    if (typeof ric === "function") {
      ric(register);
    } else {
      window.setTimeout(register, 1000);
    }
  }, []);

  return null;
}
