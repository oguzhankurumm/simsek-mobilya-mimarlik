import createMiddleware from "next-intl/middleware";
import { routing } from "@/i18n/routing";

export default createMiddleware(routing);

export const config = {
  matcher: [
    // Match all pathnames except for
    // - API/internal routes
    // - Asset-like routes from Next.js metadata conventions (icon.tsx, etc.)
    // - Any path containing a dot (e.g. favicon.ico, robots.txt, sitemap.xml)
    "/((?!api|_next|_vercel|icon|apple-icon|opengraph-image|manifest|.*\\..*).*)",
  ],
};
