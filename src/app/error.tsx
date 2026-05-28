"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, Home, RefreshCw } from "lucide-react";

// Global error boundary. Catches uncaught exceptions from any client
// component rendered under the root layout. We log the digest in dev
// (Next ships a stack trace for non-prod automatically) and offer the
// user two paths: try again (React's `reset()`) or jump home.

interface ErrorBoundaryProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function GlobalError({ error, reset }: ErrorBoundaryProps) {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production") {
      console.error("[client-error]", error);
    }
  }, [error]);

  return (
    <main className="flex min-h-dvh flex-col items-center justify-center px-6 py-12 text-center">
      <AlertTriangle className="mb-4 h-12 w-12 text-brand" strokeWidth={1.5} />
      <p className="text-[10px] font-mono uppercase tracking-widest text-ink-faint">
        Beklenmedik hata
      </p>
      <h1 className="mt-2 text-display text-3xl tracking-tight md:text-4xl">
        Bir şeyler ters gitti
      </h1>
      <p className="mt-4 max-w-md text-sm text-ink-muted md:text-base">
        Sayfayı yüklerken sorun yaşadık. Tekrar denemek isterseniz aşağıdaki
        butona basın; sorun devam ederse{" "}
        <a
          href="mailto:info@simsekmobilya.com"
          className="text-brand hover:underline"
        >
          info@simsekmobilya.com
        </a>{" "}
        ile iletişime geçebilirsiniz.
      </p>
      {error.digest ? (
        <p className="mt-3 text-[10px] font-mono text-ink-faint">
          ref: {error.digest}
        </p>
      ) : null}
      <div className="mt-8 flex flex-wrap items-center justify-center gap-2">
        <button
          onClick={reset}
          className="inline-flex items-center gap-1.5 rounded-full bg-brand px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand/90"
        >
          <RefreshCw className="h-4 w-4" /> Tekrar Dene
        </button>
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background px-5 py-2.5 text-sm font-medium hover:bg-surface-2"
        >
          <Home className="h-4 w-4" /> Anasayfa
        </Link>
      </div>
    </main>
  );
}
