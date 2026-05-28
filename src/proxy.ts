import createMiddleware from "next-intl/middleware";
import { routing } from "@/i18n/routing";

export default createMiddleware(routing);

export const config = {
  matcher: [
    // Match all pathnames except for
    // - API/internal routes
    // - Admin routes (TR-only, no locale prefix — lives at /admin/*)
    // - Commerce routes (TR-only by P2 — no locale prefix on /urunler, /sepet,
    //   /odeme, /hesabim/*, /menu, /siparis-takibi, plus legal docs)
    // - Asset-like routes from Next.js metadata conventions (icon.tsx, etc.)
    // - Any path containing a dot (e.g. favicon.ico, robots.txt, sitemap.xml)
    "/((?!api|admin|urunler|sepet|odeme|hesabim|menu|giris|kayit|sifremi-unuttum|siparis-takibi|mesafeli-satis-sozlesmesi|iade-politikasi|cayma-hakki|on-bilgilendirme|offline|sw\\.js|_next|_vercel|icon|apple-icon|opengraph-image|manifest|.*\\..*).*)",
  ],
};
