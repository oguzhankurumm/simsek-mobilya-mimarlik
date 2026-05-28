import type { Metadata } from "next";
import { WifiOff } from "lucide-react";

export const metadata: Metadata = {
  title: "Çevrimdışı — Şimşek Mobilya",
  robots: { index: false, follow: false },
};

// Fallback HTML served by the service worker when a navigation fires with no
// network. The shell still renders so the user gets a brand-coherent screen
// instead of the browser's generic offline page.

export default function OfflinePage() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center px-6 text-center">
      <WifiOff className="mb-4 h-12 w-12 text-ink-faint" />
      <h1 className="text-display text-2xl tracking-tight">
        Çevrimdışısınız
      </h1>
      <p className="mt-3 max-w-sm text-sm text-ink-muted">
        İnternet bağlantınız geri geldiğinde son baktığınız sayfa otomatik
        yüklenecek. Bu süreçte kaydedilmiş sayfalara erişebilirsiniz.
      </p>
    </main>
  );
}
