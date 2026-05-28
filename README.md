# Şimşek Mobilya & Mimarlık

Hibrit site: **atölye anlatısı + e-ticaret platformu**. 28 yıllık özel tasarım mobilya markasının dijital vitrini + Vivense/IKEA seviyesi mobile-first e-ticaret deneyimi, daf-yapi pattern'ini birebir takip eden IBAN + WhatsApp dekont ödeme akışıyla.

## Ne var?

**Marketing (TR/EN):** Hero, manifesto, portfolyo (Çalışmalarımız), hizmetler, hakkımızda, iletişim, gizlilik. Bu kısım dokunulmaz — atölyenin yüksek-margin mimarlık iş kapısı.

**E-ticaret (TR-only):**
- `/urunler` — kategori, sıralama, mobil grid
- `/urunler/[slug]` — PDP, galeri, sepete ekle, WhatsApp inquiry
- `/sepet` (drawer, sağdan kayan vaul Sheet) — qty +/-, sepetten çıkar
- `/odeme` — 3 adımlı checkout (sepet → IBAN seç + sözleşme onay → WhatsApp dekont)
- `/hesabim` — siparişler, adresler, favoriler (JWT-koruma)
- `/giris`, `/kayit`, `/sifremi-unuttum` — hesap akışı
- `/siparis-takibi` — konuk takip (orderNumber + telefon son 4 hane)
- Yasal: `/mesafeli-satis-sozlesmesi`, `/on-bilgilendirme`, `/cayma-hakki`, `/iade-politikasi`
- Mobile bottom tab nav (5 sekme), install prompt, offline fallback

**Admin panel (TR-only, `/admin/*`):**
- Dashboard (metric cards + son 10 sipariş)
- Siparişler (status filter + detay + WhatsApp link + status PATCH)
- Ürünler (CRUD + furniture fields: boyut, malzeme, renk, mekan)
- Kategoriler, IBAN'lar, WhatsApp hatları, Hero slides (inline CRUD table)
- Müşteriler (read-only)
- Ayarlar (singleton + VKN/MERSIS/ETBİS)

## Stack

| Layer | Tool |
|---|---|
| Framework | Next.js 16 (App Router · Turbopack · RSC) · React 19 · TypeScript 5 |
| Styling | Tailwind CSS v4 + `oklch()` tokens · next-themes · View Transitions API (theme toggle only) |
| i18n | next-intl 4 — TR (varsayılan) + EN, sadece marketing |
| Database | PostgreSQL (Neon önerilen) + Prisma 6 |
| Auth | jose JWT + bcryptjs (rounds 12) + sha256 token hashing |
| State | TanStack Query v5 (server) + Zustand v5 (cart, ui, wishlist) |
| UI | Radix UI primitives + vaul (drawers) + cmdk + sonner + lucide-react |
| PWA | Serwist (manifest + NetworkFirst HTML + offline fallback + install prompt) |
| Forms | react-hook-form + zod + @hookform/resolvers |
| Email | Resend (opt-in via `RESEND_API_KEY`) |
| Hosting | Vercel + Speed Insights + Analytics + Blob (ürün görselleri) |

## Hızlı başlangıç

```bash
# Node 24 LTS
cp .env.example .env.local
# .env.local'ı doldur: DATABASE_URL, DIRECT_URL, JWT_SECRET, BLOB_READ_WRITE_TOKEN

npm install
npm run db:generate      # Prisma Client
npm run db:migrate       # ilk migration
npm run db:seed          # admin user + örnek ürün + IBAN + WhatsApp line
npm run dev              # http://localhost:3000
```

DB olmadan da çalışır — `src/lib/{products,ibans,whatsapp-lines}.ts` mock fallback ile demo katalog sunar. `DATABASE_URL` set edildiğinde otomatik gerçek veriye geçer.

İlk admin girişi: `/admin/login` → `SEED_ADMIN_EMAIL` + `SEED_ADMIN_PASSWORD` (`.env.local`'den).

## Çevre değişkenleri

```bash
# Site
NEXT_PUBLIC_SITE_URL="http://localhost:3000"

# Postgres (Neon önerilen)
DATABASE_URL="postgresql://...?pgbouncer=true&sslmode=require"
DIRECT_URL="postgresql://...?sslmode=require"        # migration için pool'suz

# Auth
JWT_SECRET="<openssl rand -base64 48>"               # >= 32 karakter

# Vercel Blob (admin ürün görseli upload)
BLOB_READ_WRITE_TOKEN="vercel_blob_..."

# Email — Resend (forgot password + contact form)
RESEND_API_KEY="re_..."
CONTACT_EMAIL_TO="info@simsekmobilya.com"
CONTACT_EMAIL_FROM="noreply@simsekmobilya.com"

# İlk admin hesabı (seed sonrası şifreyi değiştir)
SEED_ADMIN_EMAIL="admin@simsekmobilya.com"
SEED_ADMIN_PASSWORD="<güçlü-şifre>"
```

## İçerik güncellemeleri

### Marketing
| Dosya | Ne için |
|---|---|
| `src/content/projects.ts` | Çalışmalarımız (TR/EN açıklamalar + kapak/galeri görselleri) |
| `src/content/services.ts` | 4 hizmet + 4-adımlı süreç |
| `src/content/team.ts` | Hakkımızda değerler + zaman çizgisi |
| `src/content/legal/*.ts` | Mesafeli satış, ön bilgilendirme, cayma hakkı, iade politikası |
| `src/config/site.ts` | Marka, telefon, sosyal medya, navigasyon |
| `src/messages/{tr,en}.json` | UI metinleri |

### E-ticaret
- **Ürünler / kategoriler / IBAN'lar / WhatsApp hatları / hero slides / ayarlar** → `/admin/dashboard/*`
- **Şema değişikliği** → `prisma/schema.prisma` düzenle, `npm run db:migrate -- --name <açıklama>`
- **Demo ürünler (DB yokken görünür)** → `src/lib/products.ts` içindeki `MOCK_PRODUCTS`

## Scripts

| Komut | Yaptığı iş |
|---|---|
| `npm run dev` | Turbopack ile local dev sunucusu |
| `npm run build` | Production build (60+ route: marketing × 2 locale + commerce + admin + API) |
| `npm run start` | Production build'i sun |
| `npm run lint` | ESLint |
| `npm test` | Vitest unit suite (66 test) |
| `npm run test:watch` | Vitest watch modu |
| `npm run test:e2e` | Playwright e2e (Chromium + Pixel 7) |
| `npm run lhci` | Lighthouse CI |
| `npm run size` | Bundle budget |
| `ANALYZE=true npm run build` | `@next/bundle-analyzer` |
| `npm run db:generate` | Prisma Client üret |
| `npm run db:push` | Schema'yı DB'ye push et (dev için hızlı) |
| `npm run db:migrate` | Migration üret + uygula |
| `npm run db:migrate:deploy` | Production migration |
| `npm run db:seed` | `prisma/seed.ts` çalıştır |
| `npm run db:studio` | Prisma Studio GUI |

## Mimari özellikler

**Money math (integer kuruş)** — JS float aritmetiği para hesabını bozar (`3 × 4166.67 = 12500.01`). Bu yüzden tüm uygulama kodunda para = **integer kuruş**. Prisma `Decimal` → integer dönüşümü `src/lib/money.ts` sınırında yapılır. Server-side `POST /api/orders` total'i DB'den yeniden hesaplar — client fiyatına güvenmez.

**Sipariş numarası** — `SM-XXXXXXXX`, 8 karakter (alphabet: 0/O/1/I/L hariç). Server-side üretilir, ~28 milyar keyspace. Konuk takip için `orderNumber + phone last4` kombinasyonu zorunlu (enumeration koruması).

**Idempotency** — Client UUID üretir, `Idempotency-Key` header'da gönderir. Server sha256 hash'i Order satırına yazar; aynı key ile gelen ikinci POST orijinal siparişi döner (network glitch sonrası retry duplicate yaratmaz).

**Stok decrement** — `prisma.product.updateMany({ where: { id, stock: { gte: qty } }, data: { stock: { decrement: qty } } })`. Eğer 0 satır etkilenirse transaction rollback → 409 dönecek. Race-free atomic decrement.

**JWT auth** — `jose` (Edge runtime safe, Next 16 middleware ile uyumlu). Token sha256 hash olarak Session/PasswordReset tablolarına yazılır; ham token sadece cookie/email'de. Müşteri cookie `SameSite=Lax`, admin cookie `SameSite=Strict`.

**Route groups** — Marketing `src/app/[locale]/`, commerce `src/app/(commerce)/`, admin `src/app/admin/`. Üç ayrı sistem yan yana; `proxy.ts` next-intl middleware'i commerce + admin route'larından geçmez. Cart drawer + bottom tabs + install prompt root layout'ta mount; admin layout'ta yok (admin'de tüketici UI'ı görünmez).

**PWA** — Serwist service worker (NetworkFirst HTML, defaultCache static, StaleWhileRevalidate images). Service worker version her build'de değişir (Next içerik hash). Install prompt 3 ziyaret sonrası gösterilir, dismiss → 30 gün sessiz.

## Test stratejisi

```bash
# Unit (vitest, 66 test)
npm test
#   tests/unit/money.test.ts           — kuruş roundtrip, TR formatPrice
#   tests/unit/order-number.test.ts    — alphabet, format, uniqueness
#   tests/unit/idempotency.test.ts     — hash determinism, validation
#   tests/unit/whatsapp.test.ts        — E.164, wa.me URL, message templates
#   tests/unit/messages.test.ts        — i18n parity (TR/EN aynı key)
#   tests/unit/utils.test.ts           — slugify, cn

# E2E (playwright, Chromium + Pixel 7)
npm run test:e2e
#   tests/e2e/commerce.spec.ts         — public route smoke
#   tests/e2e/cart.spec.ts             — add → drawer → checkout
#   tests/e2e/home.spec.ts, portfolio.spec.ts, contact.spec.ts (mevcut)
```

## Yasal uyum (Türk e-ticaret)

⚠️ **Launch öncesi tamamlanması gereken adımlar:**

1. **ETBİS başvurusu** — etbis.ticaret.gov.tr (yaklaşık 2 hafta)
2. **Mesafeli Satış Sözleşmesi** + **Ön Bilgilendirme Formu** template'leri avukat/SMMM onayı (mevcut `src/content/legal/*.ts` placeholder; gerçek metin buraya yazılır)
3. **VKN / MERSIS / ETBİS** numaraları `/admin/dashboard/settings` üzerinden girilir → footer'da otomatik görünür
4. **Cayma hakkı** (14 gün) ve **iade politikası** metni
5. **KDV dahil fiyat** standardı (tüm UI'da uygulanmış, ek bir şey gerekmez)
6. **e-Arşiv** entegrasyonu (manuel SOP yeterli, otomasyon Phase 2)

## Deployment

`main`'e push → Vercel otomatik deploy.

```bash
vercel deploy --prod
```

Production env'inde mutlaka set:
- `DATABASE_URL` + `DIRECT_URL` (Neon pooled URL)
- `JWT_SECRET` (>= 32 karakter, üretirken `openssl rand -base64 48`)
- `BLOB_READ_WRITE_TOKEN` (admin ürün görseli upload için)
- `RESEND_API_KEY` (sipariş onay maili + şifre sıfırlama)
- `NEXT_PUBLIC_SITE_URL` (production URL, CSRF origin check için)

## Project documents

- `AGENTS.md` — agent contributor rules + architecture map
- `CLAUDE.md` — Claude Code agent talimatları (AGENTS.md import eder)
- `DESIGN.md` — Commerce visual-language reduction + state matrix + brand collision policy
- `~/.gstack/projects/oguzhankurumm-simsek-mobilya-mimarlik/oguzhankurum-main-plan-*.md` — autoplan-incelenmiş plan (premises + decision audit trail)

## License

Proprietary. © Şimşek Mobilya & Mimarlık.
