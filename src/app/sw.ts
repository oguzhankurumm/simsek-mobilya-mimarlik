/// <reference lib="webworker" />
import { defaultCache } from "@serwist/next/worker";
import type { PrecacheEntry, SerwistGlobalConfig } from "serwist";
import { Serwist } from "serwist";

// Şimşek service worker. Strategy split, per Phase 2/3 review T21:
// - Pages / product HTML → NetworkFirst (stale price safety; SW never
//   serves a 6-month-old PDP from cache).
// - Static assets (JS/CSS chunks, fonts) → defaultCache patterns (Next
//   builds add content hashes, so CacheFirst there is safe).
// - Images → StaleWhileRevalidate.
// Service worker version bumps every deploy by virtue of __SW_MANIFEST,
// which Next regenerates per build.

declare global {
  interface WorkerGlobalScope extends SerwistGlobalConfig {
    __SW_MANIFEST: (PrecacheEntry | string)[] | undefined;
  }
}

declare const self: ServiceWorkerGlobalScope & {
  __SW_MANIFEST: (PrecacheEntry | string)[] | undefined;
};

const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST,
  skipWaiting: true,
  clientsClaim: true,
  navigationPreload: true,
  runtimeCaching: defaultCache,
  fallbacks: {
    entries: [
      {
        url: "/offline",
        matcher: ({ request }) => request.destination === "document",
      },
    ],
  },
});

serwist.addEventListeners();
