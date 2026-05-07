# Şimşek Mobilya & Mimarlık

Marka sitesi — özel tasarım mobilya ve mimari proje. 28 yıllık atölyenin dijital vitrini.

## Stack

- **Framework:** Next.js 16 (App Router · Turbopack · React Server Components) · React 19 · TypeScript
- **Styling:** Tailwind CSS v4 with `oklch()` tokens · next-themes · View Transitions API
- **i18n:** `next-intl@4` — Türkçe (varsayılan) + İngilizce, lokalize URL yolları
- **Content:** statik TypeScript dosyaları (`src/content/`) — DB yok, dağıtım hızlı
- **Forms:** `react-hook-form` + `zod` + Next.js server action (Resend opsiyonel)
- **Hosting:** Vercel (Speed Insights + Analytics aktif)

## Quick start

```bash
# Node 24 LTS
cp .env.example .env.local
npm install
npm run dev    # http://localhost:3000
```

## Content workflow

Bütün metin ve görseller statik TS dosyalarında — yayına alıp güncellemek için git commit yeterli.

| Dosya | Ne için |
|---|---|
| `src/content/projects.ts` | Çalışmalarımız (kapak/galeri görselleri, TR/EN açıklamalar) |
| `src/content/services.ts` | 4 hizmet kartı + 4-adımlı süreç |
| `src/content/team.ts` | Hakkımızda sayfasındaki değerler + zaman çizgisi |
| `src/config/site.ts` | Marka, telefon, sosyal medya, navigasyon |
| `src/messages/tr.json` & `en.json` | Tüm UI metinleri |

### Instagram görsellerini gerçek çalışmalarla değiştirme

Şu an çalışmalar Unsplash placeholder'ları kullanıyor. Gerçek Şimşek görselleriyle değiştirmek için:

1. Görselleri `/public/work/<slug>/` klasörüne koyun (ör. `/public/work/atelye-besiktas/cover.jpg`)
2. `src/content/projects.ts` içindeki `cover.src` ve `gallery[].src` URL'lerini local yola çevirin
3. Veya Vercel Blob'a yükleyip URL'leri yapıştırın
4. `next.config.ts` `remotePatterns` listesine domain eklenmesi gerekebilir

Caption + proje açıklamaları için Instagram post'larından doğrudan metin kopyalayabilirsiniz.

## Scripts

| Komut | Yaptığı iş |
|---|---|
| `npm run dev` | Turbopack ile local dev sunucusu |
| `npm run build` | Production build (10 sayfa: 5 route × 2 locale) |
| `npm run start` | Production build'i sun |
| `npm run lint` | ESLint |
| `npm test` | Vitest unit suite |
| `npm run test:watch` | Vitest watch modu |
| `npm run test:e2e` | Playwright e2e (Chromium + Pixel 7) |
| `npm run lhci` | Lighthouse CI (perf 85+, a11y 95+) |
| `npm run size` | Bundle budget (200 KB First Load JS) |
| `ANALYZE=true npm run build` | `@next/bundle-analyzer` |

## Tema

- `:root` LIGHT tokens — soft ivory zemin (`#FAFAF7`), neredeyse siyah mürekkep, marka kırmızısı (`#ED1C24`)
- `.dark` DARK tokens — gerçek siyah yüzeyler, soft white mürekkep
- `next-themes` `<html>`'a `class="dark"` ekler (sistem | açık | koyu)
- 280 ms View Transitions cross-fade `prefers-reduced-motion: no-preference` arkasında

## Lokalizasyon

| Yol | TR | EN |
|---|---|---|
| Anasayfa | `/` | `/en` |
| Çalışmalarımız | `/calismalar` | `/en/work` |
| Çalışma detay | `/calismalar/[slug]` | `/en/work/[slug]` |
| Hizmetler | `/hizmetler` | `/en/services` |
| Hakkımızda | `/hakkimizda` | `/en/about` |
| İletişim | `/iletisim` | `/en/contact` |

## E-mail backend (opsiyonel)

İletişim formu, `RESEND_API_KEY` set edilmediğinde de çalışır — başvurular Vercel logs'a düşer. Production için:

```bash
RESEND_API_KEY=re_xxxxxxxxxxxx
CONTACT_EMAIL_TO=info@simsekmobilya.com
CONTACT_EMAIL_FROM=noreply@simsekmobilya.com
```

[Resend](https://resend.com) hesabı açın, domain'i doğrulayın, anahtarı Vercel env'e ekleyin.

## Deployment

`main`'e push → Vercel otomatik deploy.

```bash
vercel deploy --prod
```

## Project documents

- `AGENTS.md` — agent contributor rules
- `CLAUDE.md` — Claude Code agent için talimatlar (AGENTS.md'yi import eder)

## License

Proprietary. © Şimşek Mobilya & Mimarlık.
