<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Şimşek Mobilya & Mimarlık — Agent Notes

## Stack snapshot
- **Framework:** Next.js 16 (App Router, Turbopack, RSC) + React 19 + TypeScript
- **Styling:** Tailwind CSS v4 with `oklch()` tokens, light/dark via `next-themes` + 280 ms View Transitions cross-fade
- **i18n:** `next-intl@4` with **2 locales** — `tr` (default) and `en`. Localised pathnames live in `src/i18n/routing.ts` (`/portfolyo` ↔ `/portfolio`, etc.).
- **Content:** static TypeScript files under `src/content/` (no DB). Edit those to add/replace projects, services, or team values.
- **Forms:** `react-hook-form` + `zod` + a server action (`src/server/contact-action.ts`). Resend sending is opt-in via `RESEND_API_KEY`; without it, submissions are validated and logged.
- **Hosting:** Vercel; Speed Insights + Analytics wired up.

## Where things live
```
src/
├── app/
│   ├── [locale]/             # Public site (TR default, EN at /en/*)
│   │   ├── page.tsx          # Home
│   │   ├── portfolio/        # /calismalar (TR), /en/work (EN) — internal canonical name
│   │   │   ├── page.tsx
│   │   │   └── [slug]/page.tsx
│   │   ├── services/         # /hizmetler · /en/services
│   │   ├── about/            # /hakkimizda · /en/about
│   │   └── contact/          # /iletisim · /en/contact
│   ├── layout.tsx            # Root: fonts, metadata, ThemeProvider
│   ├── globals.css           # Brand tokens (oklch + #ED1C24)
│   ├── manifest.ts           # PWA manifest
│   ├── sitemap.ts            # Sitemap with hreflang alternates
│   ├── robots.ts             # robots.txt
│   ├── opengraph-image.tsx   # Default OG image
│   ├── icon.tsx & apple-icon.tsx
├── components/
│   ├── atoms/                # logo, eyebrow, reveal, theme-toggle, locale-switcher, json-ld, instagram-cta
│   ├── layout/               # site-header, site-footer, sticky-contact-bar
│   ├── sections/             # hero, manifesto, featured-projects, services-preview, process, stats, instagram-strip, contact-cta
│   ├── portfolio/            # project-card, category-filter
│   ├── contact/              # contact-form
│   ├── providers/            # theme-provider
│   └── ui/                   # shadcn-style Radix wrappers (button, input, label, select, dialog, …)
├── content/                  # ★ Edit these to update copy/portfolio
│   ├── projects.ts           # Portfolio entries (cover/gallery URLs, TR/EN content)
│   ├── services.ts           # 4 services + process steps
│   └── team.ts               # Values + milestones for /about
├── config/site.ts            # Single source of truth: brand, contact, social, nav, stats
├── i18n/                     # next-intl config (routing, navigation, request)
├── lib/utils.ts              # cn(), slugify(), shimmerDataUrl()
├── messages/{tr,en}.json     # UI copy
├── proxy.ts                  # next-intl middleware (renamed from middleware.ts in Next 16)
└── server/contact-action.ts  # Contact form server action (zod + Resend)
```

## Editing portfolio content
1. Open `src/content/projects.ts`
2. Add/edit a `Project` entry. Required fields: `slug`, `category`, `year`, `location`, `titleTr/En`, `summaryTr/En`, `storyTr/En`, `scopeTr/En`, `materialsTr/En`, `cover`, `gallery`.
3. Add `featured: true` to surface on the home page.
4. Replace placeholder Unsplash URLs with your real Vercel Blob or local `/portfolio/<slug>.jpg` paths.
5. The `<slug>` becomes the URL. Keep slugs ASCII, lowercase, dash-separated.

## Adding a new locale
The site is intentionally TR + EN only. If you must add another locale:
1. Add the code to `routing.locales` in `src/i18n/routing.ts`.
2. Add localized variants to every entry in `routing.pathnames`.
3. Create `src/messages/<code>.json` matching the existing key shape.
4. Add an option to `src/components/atoms/locale-switcher.tsx`.
5. Update `unit/messages.test.ts` to keep parity guaranteed.

## Theming
- `:root` defines LIGHT tokens (soft ivory bg, near-black ink, brand red).
- `.dark` overrides with the studio-night palette (true black surfaces, soft white ink).
- `next-themes` toggles `class="dark"` on `<html>` (system | light | dark).
- View Transitions API supplies a 280 ms cross-fade when the toggle fires; gated behind `prefers-reduced-motion: no-preference`.

## Performance & accessibility
- Hero uses `priority` + `fetchPriority="high"` and warm-preconnect for `images.unsplash.com`.
- All images go through `next/image` with `placeholder="blur"` (shimmer SVG).
- `optimizePackageImports: ["lucide-react", "framer-motion"]` keeps the client bundle slim.
- Reduced-motion users get static layouts (no Ken Burns, no marquee).
- Color contrast tokens are tuned for WCAG AA on both palettes.

## Quick scripts
- `npm run dev` — local dev (Turbopack)
- `npm run build` — production build (5 routes pre-rendered × 2 locales = 10 entries)
- `npm test` — Vitest unit suite
- `npm run test:e2e` — Playwright (Chromium desktop + Pixel 7 mobile)
- `npm run lhci` — Lighthouse CI against home + 4 deep links
- `npm run size` — bundle budget check
