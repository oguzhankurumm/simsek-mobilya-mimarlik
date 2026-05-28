<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Şimşek Mobilya & Mimarlık — Agent Notes

This codebase is **two products in one app**:

1. **Atelier marketing site** — TR/EN, RSC-pure, portfolio + services + about + contact + privacy. The brand moat: 28 years, 1,200+ projects, "Custom-crafted furniture. Your home, from our atelier."
2. **E-commerce platform** — TR-only, catalog + cart + checkout + customer account + admin panel. IBAN + WhatsApp dekont payment (no card by design — see DESIGN.md).

Both live under one Next.js 16 app, separated by route groups.

## Stack snapshot
- **Framework:** Next.js 16 (App Router, Turbopack, RSC) + React 19 + TypeScript
- **Styling:** Tailwind CSS v4 with `oklch()` tokens, light/dark via `next-themes` + 280 ms View Transitions cross-fade (theme toggle only — commerce routes opt out)
- **i18n:** `next-intl@4` — TR (default) + EN. Marketing pages localized; commerce + admin are TR-only and live OUTSIDE the `[locale]` segment.
- **Database:** PostgreSQL via Prisma 6. 14 models, ready-stock catalog, integer-kuruş money math.
- **Auth:** JWT cookies signed with `jose` (Edge-runtime safe), bcrypt rounds 12, sha256-hashed session/reset tokens.
- **State:** TanStack Query v5 (server data) + Zustand v5 (cart, ui, wishlist) — cart is persisted to `localStorage`.
- **UI primitives:** Radix UI + vaul (drawers) + cmdk + sonner toast.
- **PWA:** Serwist service worker (manifest, NetworkFirst HTML, offline fallback), install prompt after 3 visits.
- **Forms:** `react-hook-form` + `zod`.
- **Email:** Resend, opt-in via `RESEND_API_KEY` (otherwise console-logged in dev).
- **Hosting:** Vercel; Speed Insights + Analytics + Blob (admin uploads).

## Where things live
```
src/
├── app/
│   ├── layout.tsx               # Root: fonts, metadata, ThemeProvider,
│   │                            # CartDrawer + BottomTabs + MobileMenuDrawer
│   │                            # + InstallPrompt + SwRegister mounted here
│   │                            # so they ride along on marketing + commerce.
│   ├── globals.css              # Brand tokens (oklch + #ED1C24)
│   ├── manifest.ts              # PWA manifest (standalone, brand red)
│   ├── sw.ts                    # Serwist service worker source
│   ├── offline/page.tsx         # SW fallback for failed navigations
│   ├── sitemap.ts, robots.ts, opengraph-image.tsx, icon.tsx, apple-icon.tsx
│   │
│   ├── [locale]/                # Marketing — TR/EN
│   │   ├── layout.tsx           # next-intl provider, SiteHeader, SiteFooter,
│   │   │                        # StickyContactBar, CookieBanner
│   │   ├── page.tsx             # Home: hero → manifesto → FEATURED PRODUCTS
│   │   │                        # → portfolio → stats → testimonials → …
│   │   ├── portfolio/, services/, about/, contact/, privacy/
│   │
│   ├── (commerce)/              # E-commerce — TR-only, route group, no
│   │   ├── layout.tsx           # locale segment in URL.
│   │   ├── urunler/             # /urunler  (list, ISR 60s)
│   │   │   └── [slug]/page.tsx  # /urunler/:slug  (PDP, dynamic)
│   │   ├── odeme/               # /odeme  (3-step checkout)
│   │   ├── giris/, kayit/, sifremi-unuttum/
│   │   ├── hesabim/             # JWT-guarded customer dashboard
│   │   │   ├── layout.tsx       # getCurrentUser() or redirect to /giris
│   │   │   ├── page.tsx, siparislerim/, adreslerim/, favorilerim/
│   │   ├── siparis-takibi/      # Guest tracking (orderNumber + phone last4)
│   │   ├── mesafeli-satis-sozlesmesi/, on-bilgilendirme/, cayma-hakki/,
│   │   │   iade-politikasi/    # Legal docs (rendered from src/content/legal/)
│   │
│   ├── admin/                   # Admin panel — TR-only, route OUTSIDE
│   │   ├── layout.tsx           # [locale]. JWT cookie name differs from
│   │   ├── login/page.tsx       # customer cookie (SameSite=Strict).
│   │   ├── dashboard/
│   │   │   ├── layout.tsx       # requireAdminOrRedirect()
│   │   │   ├── page.tsx         # Metric cards + last 10 orders
│   │   │   ├── orders/          # list + [orderNumber] detail (status PATCH)
│   │   │   ├── products/        # list + new + [id] edit
│   │   │   ├── categories/, ibans/, whatsapp/, hero/, customers/, settings/
│   │
│   ├── api/                     # Route handlers
│   │   ├── orders/              # POST (create order w/ idempotency)
│   │   │   └── track/route.ts   # GET (guest tracking)
│   │   ├── ibans/, whatsapp/active/
│   │   ├── auth/                # register/login/logout/me/forgot/reset
│   │   └── admin/               # Per-entity CRUD (orders, products, …)
│   │
├── components/
│   ├── atoms/                   # logo, eyebrow, reveal, theme-toggle, …
│   ├── layout/                  # site-header, site-footer, sticky-contact-bar
│   ├── sections/                # hero, manifesto, FEATURED-PRODUCTS,
│   │                            # featured-projects, services-preview, …
│   ├── commerce/                # cart-drawer, bottom-tabs, mobile-menu-drawer,
│   │                            # cart-icon-button, product-card,
│   │                            # add-to-cart-button, whatsapp-inquiry-button,
│   │                            # iban-card, auth-forms, order-tracking-form,
│   │                            # install-prompt, sw-register, logout-button
│   ├── admin/                   # admin-sidebar, product-form, order-status-form,
│   │                            # settings-form, simple-crud-table
│   ├── providers/               # theme-provider, query-provider
│   └── ui/                      # shadcn-style Radix wrappers
│
├── content/                     # ★ Edit these to update marketing copy.
│   ├── projects.ts, services.ts, team.ts
│   └── legal/                   # mesafeli-satis, on-bilgilendirme,
│                                # cayma-hakki, iade-politikasi.ts
├── config/
│   ├── site.ts                  # Brand, contact, social, nav, stats
│   └── commerce-nav.ts          # COMMERCE_BOTTOM_TABS, MOBILE_DRAWER_LINKS
├── i18n/                        # next-intl config (routing, navigation, request)
├── lib/
│   ├── prisma.ts                # Prisma singleton
│   ├── money.ts                 # Integer-kuruş math + TR formatPrice
│   ├── auth.ts                  # jose JWT + bcrypt + sha256
│   ├── get-user.ts              # getCurrentUser({admin}) + requireAdmin…
│   ├── order-number.ts          # SM-XXXXXXXX generator (non-enumerable)
│   ├── idempotency.ts           # POST /api/orders header support
│   ├── whatsapp.ts              # wa.me URL builder + message templates
│   ├── products.ts, ibans.ts, whatsapp-lines.ts, site-settings.ts
│   ├── send-email.ts            # Resend wrapper + password-reset template
│   ├── utils.ts                 # cn(), slugify(), shimmerDataUrl()
│   └── store/                   # zustand: cart (persisted), ui, wishlist
├── messages/{tr,en}.json        # Marketing UI copy
├── proxy.ts                     # next-intl middleware. Excludes commerce
│                                # + admin + /api + /sw.js + /offline so they
│                                # do NOT get locale-rewritten.
└── server/contact-action.ts     # Contact form server action

prisma/
├── schema.prisma                # 14 models (User, Session, Category,
│                                # Product, ProductImage, StockNotification,
│                                # Iban, WhatsappLine, Order, OrderItem,
│                                # HeroSlide, SiteSettings, Address, Wishlist,
│                                # PasswordReset)
└── seed.ts                      # `npm run db:seed` — admin user + sample
                                 # product + IBAN + WhatsApp line

tests/
├── unit/                        # vitest — money, order-number, idempotency,
│                                # whatsapp, messages, utils
└── e2e/                         # playwright — home, portfolio, contact,
                                 # commerce (smoke), cart (drawer flow)
```

## Editing portfolio content
1. Open `src/content/projects.ts`
2. Add/edit a `Project` entry. Required fields: `slug`, `category`, `year`, `location`, `titleTr/En`, `summaryTr/En`, `storyTr/En`, `scopeTr/En`, `materialsTr/En`, `cover`, `gallery`.
3. Add `featured: true` to surface on the home page.
4. Replace placeholder Unsplash URLs with your real Vercel Blob or local `/portfolio/<slug>.jpg` paths.

## Editing the e-commerce catalog
Two paths:

**A) Admin panel (preferred once DB is provisioned)**
1. Run `npm run db:migrate` + `npm run db:seed` to provision schema + initial admin
2. Sign in at `/admin/login`
3. Add categories first → then products under `/admin/dashboard/products/new`
4. Upload images via URL field for now; Vercel Blob upload is wired but the picker UI is Phase E.2

**B) Demo catalog (no DB)**
- `src/lib/products.ts` exports `MOCK_PRODUCTS` — 6 hand-curated items used as fallback when Prisma is unreachable or empty. Tweak there to change what shows up on `/urunler` and the home "Öne Çıkan Ürünler" section during development.

## Adding a new locale to **marketing only**
Commerce is TR-only by design (P2 in `~/.gstack/projects/.../oguzhankurum-main-plan-*.md`). To add another marketing locale:
1. Add the code to `routing.locales` in `src/i18n/routing.ts`.
2. Add localized variants to every entry in `routing.pathnames`.
3. Create `src/messages/<code>.json` matching the existing key shape.
4. Add an option to `src/components/atoms/locale-switcher.tsx`.
5. **Do not** add to `(commerce)/` route group — commerce stays TR-only.

## Theming
- `:root` defines LIGHT tokens (soft ivory bg, near-black ink, brand red).
- `.dark` overrides with the studio-night palette (true black surfaces, soft white ink).
- `next-themes` toggles `class="dark"` on `<html>` (system | light | dark).
- View Transitions API supplies a 280 ms cross-fade on theme toggle only; commerce route changes opt out (instant nav for checkout speed).

## Money math
All money lives in **integer kuruş** in app code. Prisma `Decimal` is converted at the boundary in `src/lib/money.ts`. Server-side order totals are recomputed from DB in `POST /api/orders` — client-sent prices are never trusted. See `tests/unit/money.test.ts` for the float-drift invariant.

## Auth boundaries
- Customer JWT cookie: `simsek_session`, `SameSite=Lax`, 30-day TTL.
- Admin JWT cookie: `simsek_admin_session`, `SameSite=Strict`, 7-day TTL.
- Two cookies coexist; logging out as admin doesn't kick the customer session and vice-versa.
- All sensitive routes (`/api/admin/*`, `/admin/dashboard/*`, `/api/auth/*` mutations) use `getCurrentUser({admin})` at the layout or route-handler level. `requireAdminOrRedirect()` is the layout sugar.

## Performance & accessibility
- Hero uses `priority` + `fetchPriority="high"` and warm-preconnect for `images.unsplash.com`.
- All images go through `next/image` with `placeholder="blur"` (shimmer SVG).
- `optimizePackageImports: ["lucide-react", "framer-motion"]` keeps the client bundle slim.
- Reduced-motion users get static layouts (no Ken Burns, no marquee).
- Color contrast tokens are tuned for WCAG AA on both palettes.
- Bottom tabs use `safe-area-inset-bottom` for iPhone home indicator.

## Quick scripts
- `npm run dev` — local dev (Turbopack)
- `npm run build` — production build (60+ routes, marketing + commerce + admin + API)
- `npm test` — Vitest unit suite (66 tests)
- `npm run test:e2e` — Playwright (Chromium desktop + Pixel 7 mobile)
- `npm run lhci` — Lighthouse CI against home + 4 deep links
- `npm run size` — bundle budget check
- `npm run db:generate` / `db:push` / `db:migrate` / `db:seed` / `db:studio` — Prisma

## When in doubt
- Visual decisions on commerce surfaces → `DESIGN.md` (visual-language reduction notes, state matrix, brand collision policy)
- Architectural decisions → `~/.gstack/projects/oguzhankurumm-simsek-mobilya-mimarlik/oguzhankurum-main-plan-*.md` (the autoplan-reviewed plan; premises P1-P12 are bindings, not suggestions)
