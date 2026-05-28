# DESIGN.md — Şimşek Mobilya & Mimarlık

Hibrit ürünün — atelier marketing + e-commerce — görsel/UX standartları. Şu sorulara cevap verir:

- Marketing sayfasından commerce sayfasına geçen müşteri ne hisseder?
- "Sepete Ekle" butonu nasıl görünür ki Vivense klonu olmasın?
- Bir component sözcüksüz "atelier" mi söylüyor, yoksa "ucuz e-ticaret" mi?

Bu doküman /autoplan Phase 2 (Design) incelemesinin somut çıktısıdır. Findings T05, T06, T07, T19 buradan referansla taşınmıştır.

## 1. Marka prensibi: Editorial restraint

Şimşek'in dijital sesi sakin, ölçülü, atölye-merkezli. 28 yıllık iş + 1.200+ proje, kendini bağırmadan anlatır. Bu, commerce yüzeylerinde de korunur — Vivense, Hepsiburada, Trendyol gibi yarış-fiyat estetiği üzerinden çalışan markaların kullanım biçimine *bilinçli* olarak karşı durur.

**Yapılır:**
- Eyebrow (10px, mono, uppercase, letter-spacing wide) + display heading (Fraunces serif)
- Cover-led ürün kartları — görsel öne çıkar, fiyat ikinci dereceden
- Tek bir fiyat — `compareAtPrice` sadece gerçek bir indirim varsa görünür
- KDV dahil bilgisi her fiyatın yanında — sürpriz yok

**Yapılmaz:**
- Kırmızı şerit/ribbon discount badge'leri
- "% indirim" pul tasarımları
- Animated yanıp sönen "fırsat" indicator'ları
- Yapay aciliyet ("son 1 saat", "stok azalıyor!!!!") — gerçek stok az ise "Son 2 adet" tek satır, brand tonunda
- "ÖZEL FİYAT" badge'i — biz ölçülü konuşuruz

## 2. Renk + tipografi tokens

`src/app/globals.css` tek kaynak:

```
--brand: oklch(64% .25 27)    # #ED1C24
--ink: oklch(20% 0 0)         # near-black
--ink-muted: oklch(48% 0 0)
--ink-faint: oklch(72% 0 0)
--background: oklch(98% .01 80)   # soft ivory
--surface-2: oklch(95% .01 80)
--border: oklch(90% .01 80)
```

Dark mode override'ları gerçek siyah surface'ler + soft white ink kullanır.

`brand` rengi commerce yüzeylerinde **kısıtlı** kullanılır:
- ✅ Birincil CTA buttonlar (Sepete Ekle, Ödemeye Geç, Ödemeyi Yaptım)
- ✅ Cart badge sayısı
- ✅ Aktif bottom tab indicator
- ✅ "Son X adet" stok urgency mikrotipografisi
- ❌ Discount şeritleri
- ❌ Hover state'ler (text-brand kullanabilir ama buton dolgusu olmaz)
- ❌ Container background'ları

Tipografi:
- **Display headings:** Fraunces (variable opsz + SOFT), letter-spacing tight
- **Body:** Inter (latin + latin-ext), default tracking
- **Eyebrows:** Inter, 10px, uppercase, font-mono, letter-spacing widest, `text-ink-faint`
- **Mono / numbers (fiyat, sipariş no):** `tabular-nums`

## 3. Bottom tab navigation

`src/config/commerce-nav.ts` → `COMMERCE_BOTTOM_TABS`.

```
[ 🏠 Ana ] [ 🛍️ Ürünler ] [ 🛒 Sepet ●3 ] [ 👤 Hesap ] [ ☰ Menü ]
```

**Kararlar:**
- 5 sekme (4 değil) — "Menü" sekmesi atölye anlatısı + favoriler + adresler + yasal belgeleri taşıyan drawer'ı açar. Çalışmalarımız bottom tab'da bağırmaz ama tek tıkla erişilir.
- Label kısa (≤6 karakter) — `Çalışmalarımız` (14 char) 360px ekranda overflow eder. NAV_ITEMS'tan ayrı bir const ile yönetilir.
- safe-area-inset-bottom — iPhone home indicator için.
- `bg-background/95 backdrop-blur-xl` — atelier dokusunu korur, Vivense'in opaque kırmızı bar'ından farklı.
- Aktif tab `text-brand` + ufak ikon highlight; pasif `text-ink-muted`.
- Cart badge yalnızca `>0` ise; sayı `9+` üzerinde clamp.

## 4. Drawer pattern

Cart + mobile menu drawer'lar **vaul** (`Drawer.Root direction="right"`) kullanır.

Standartlar:
- Sağdan kayar, full-height, max-width `sm:max-w-sm`
- Header (border-bottom, padlama 16px) — eyebrow + close
- Body (overflow-y-auto, divide-y items)
- Footer (border-top, surface-2 bg, sticky)
- Background overlay `bg-black/50`, click → dismiss
- Body scroll lock vaul tarafından handle edilir (override etme)
- iOS-style snap + drag-to-dismiss vaul default

Üç drawer (cart, mobile menu, install prompt) ve bir route-page (`/odeme`) — modal pattern'i `Dialog` Radix değil hep `Drawer` vaul. Tutarlı motion.

## 5. Product card

`src/components/commerce/product-card.tsx`.

```
┌───────────────────────┐
│                       │
│   Cover image 4:5     │
│                       │  ← group:hover scale-105
│                       │
└───────────────────────┘
 KATEGORİ                  ← eyebrow, mono, 10px
 Ceviz Modüler TV…         ← name, 16px, tracking-tight
 240 × 42 × 200 cm         ← dimensions, optional, 12px
 37.500,00 ₺  42.500 ₺    ← sale price, optional old price strikethrough
```

**Out-of-stock state** muted, ribbon değil pill:
```
┌───────────────────────┐
│                       │ ← image grayscale opacity-60
│       Stokta Yok ◯    │ ← top-right pill, bg-background/90 backdrop-blur
│                       │
└───────────────────────┘
```

**Low-stock state** "Son 2 Adet" pill aynı pozisyon, `text-brand`.

**Asla yapılmaz:**
- Yıldız puanlama widget'ı (yorum sistemi yok)
- "Hızlı bak" hover overlay'i (PDP zaten 1 tıklama uzakta)
- "Sepete ekle" buton card içinde (PDP'de yer alır)

## 6. Buton hiyerarşisi

| Tier | Stil | Kullanım |
|---|---|---|
| Primary | `bg-brand text-white rounded-full h-12 px-6` | Sepete Ekle, Ödemeye Geç, Ödemeyi Yaptım, Giriş Yap |
| Secondary | `border border-border bg-background` | WhatsApp&apos;tan Sor, Geri Dön, "Sonra" |
| Tertiary text | `text-ink-muted hover:text-brand text-xs` | Şifremi unuttum, Hesabın yok mu? |
| Ghost icon | `h-9 w-9 rounded-md hover:bg-surface-2` | Header cart icon, theme toggle |

WhatsApp özel: `bg-[#25D366]` resmi WA yeşili. Brand kırmızısı için değil — burası "platform-native" hisse hizmet eder.

## 7. Checkout step pattern

3 adım, sabit step indicator. Her adım:
- 1 başlık (text-lg font-semibold)
- Açıklayıcı microcopy (text-sm text-ink-muted)
- 1 primary CTA (en alt, full-width)
- 1 secondary CTA (geri dön) — text link, alt çizgi yok

Adım 2 (ödeme bilgileri) — mesafeli sözleşme + ön bilgilendirme onay checkbox'ı zorunlu. Buton text: **"Ödemeyi Yaptım →"** + altta küçük microcopy *"Bu buton ödeme yükümlülüğü doğurur"* (mevzuat gereği görünür).

Adım 3 (success) — yeşil tik, sipariş numarası kart içinde + büyük yeşil WhatsApp deeplink. **Number padded letter-spacing wide tabular-nums** — kopyalanması kolay.

## 8. State matrix

Her ekran için tanımlı durumlar:

### Cart drawer
- **Empty** — ShoppingBag icon, "Sepetiniz boş", CTA → /urunler
- **Loading** — N/A (zustand persistent, ilk render mounted state)
- **Hydration** — `mounted` state pattern (SSR'da boş gösterilir)
- **Item removed (animation)** — yok, immediate (sonner toast yeterli)
- **Stock exceeded** — `+` butonu disabled, opacity-40

### /urunler list
- **Empty (no products)** — "Henüz ürün eklenmedi" text-sm text-ink-muted
- **DB unreachable** — MOCK_PRODUCTS fallback + amber banner ("Demo katalog — DATABASE_URL bağla")
- **Filter applied → 0 results** — gelecek state, Phase 2 (şu an filter v1'de yok)
- **Loading** — ISR 60s, statik render, loading state yok

### PDP
- **Out of stock** — "Stokta Yok" pill + WhatsappInquiryButton primary + "Stok bildirimi" CTA (gelecek)
- **Low stock (<=2)** — "Son X Adet" pill, brand color
- **Demo mode** — amber "Demo veri" banner üstte
- **Image load fail** — `placeholder-product.svg` fallback

### Checkout
- **Step 1, empty cart** — "Sepetiniz boş" + CTA → /urunler
- **Step 2, IBAN unselected** — error message "Lütfen ödeme yapacağınız IBAN'ı seçin"
- **Step 2, terms unchecked** — error message blocks submit
- **POST /api/orders failure** — toast error + retry button
- **Step 3** — orderNumber visible, WhatsApp button enabled
- **WhatsApp number unconfigured** — fallback text "info@simsekmobilya.com adresine dekontu gönderebilirsiniz"

### Admin order detail
- **Status select pending** — opacity-60 wrapper, "Kaydediliyor…" microcopy
- **Bulk product delete** — confirm() prompt
- **Image upload fail** — toast error, original URL preserved

### Auth forms
- **Field validation error** — `text-red-600` below field, inline
- **Server error** — sonner toast
- **Network offline** — sonner toast fallback message
- **Password show/hide** — Eye/EyeOff icon button right-inset

### Install prompt
- **Not eligible** — null (no render)
- **Eligible after 3 visits + no dismissed-until** — slide-up at bottom right (desktop) / above bottom tabs (mobile)
- **Dismissed** — 30-day localStorage flag prevents re-render

## 9. View Transitions kapsamı

280ms cross-fade **yalnızca theme toggle'da** uygulanır. Commerce route geçişleri (`/urunler → /urunler/[slug]`, `/sepet → /odeme`) İNSTANT olmalı — checkout flow'a 280ms tampon dünyada hiçbir conversion'a yardım etmez.

`src/components/atoms/theme-toggle.tsx` `document.startViewTransition` çağrısını kendi içinde tutar. Diğer hiçbir komponent View Transitions API'sini çağırmaz.

## 10. PWA install banner

İlk **3 ziyaretten sonra** + son 30 günde dismiss olmamışsa görünür. Görünüm:

- Mobile: bottom-left + bottom-right edges, `bottom-[calc(env(safe-area-inset-bottom)+72px)]` (bottom tab üstünde)
- Desktop: bottom-right `bottom-6 right-6`, max-width sm
- Brand kırmızı 40px köşeli kare + "Şimşek Mobilya uygulaması" başlık
- 2 buton: "Yükle" (primary) + "Sonra" (secondary)
- X close icon — 30 gün sessizliğe gönderir

beforeinstallprompt event yakalanır; install başarısızsa silent dismiss. Eylem-zoraki açılmaz, dismiss memory respect edilir.

## 11. Brand collision policy

**Soru:** Müşteri `/portfolyo`'dan `/urunler`'e geçtiğinde markayı aynı marka mı algılıyor?

**Cevap:** Evet, eğer aşağıdaki kurallar uygulanırsa:

1. Header değişmez — aynı SiteHeader iki tarafta da (cart icon eklendi ama hala sticky scroll-aware, aynı oklch tokens)
2. Footer değişmez — aynı SiteFooter iki tarafta da (commerce'da legal links + VKN/MERSIS strip ek olarak görünür)
3. Bottom tabs ortak — atölye linkleri (Çalışmalarımız) Menü drawer'da first-class
4. Tipografi paylaşılır — Fraunces display + Inter body iki sistemde de
5. Ana sayfa: hero + manifesto + **Öne Çıkan Ürünler** + portfolyo + … (commerce ana sayfada "İncele" CTA'lı kartlar, "Sepete Ekle" değil — atölye sesi korunur)

**Asla:**
- Vivense-style banner takeover ("YIL SONU İNDİRİMİ %70'E VARAN") landing'i
- Discount sayacı (countdown timer)
- "Trendyol'da bul" / "Hepsiburada'da bul" pin'leri
- Affiliate sosyal proof'u ("4.8 ⭐ from 12,453 buyers" — bizim sistemimizde yorum yok)

## 12. Yasal görünürlük

Türk e-ticaret mevzuatı gereği checkout step 2'de:
- KDV dahil fiyat etiketi her satır yanında
- Mesafeli Satış Sözleşmesi linki (yeni sekme açılır)
- Ön Bilgilendirme linki (yeni sekme)
- "Mesafeli Satış Sözleşmesi ve Ön Bilgilendirme metinlerini okudum, onaylıyorum" checkbox **zorunlu**
- Buton text: "Ödemeyi Yaptım" + alt mikrotipografi "Bu buton ödeme yükümlülüğü doğurur"

Footer'da `SiteSettings` set edildiğinde **VKN · MERSIS · ETBİS** numaraları otomatik görünür (commerce + marketing TR locale'inde). Müşteri herhangi bir an satıcı kimliğini doğrulayabilir.

## 13. Test ettiğin şeyler

Her commerce komponentinde manuel kontrol listesi:

- [ ] Mobile (375×667) + Tablet (768) + Desktop (1280) breakpoints
- [ ] Light mode + dark mode
- [ ] TR locale (varsayılan) + (commerce için yalnız TR ama marketing test EN)
- [ ] Keyboard navigation (tab order, Escape kapatır drawer, Enter submit form)
- [ ] Screen reader (NVDA / VoiceOver) — buton aria-label, drawer role="dialog"
- [ ] Touch target ≥44×44 — bottom tab, drawer close icon
- [ ] Tap target spacing ≥8 — yan yana iki action button arasında
- [ ] Empty state (cart, list, hesabım, admin)
- [ ] Loading state (form submitting, IBAN copy)
- [ ] Error state (network fail, validation, server 500)
- [ ] Reduced motion (`prefers-reduced-motion: reduce`) — animasyonlar disable

## 14. Asla bu component'leri ekleme

Bu listenin amacı kararı bir kere ver, sonra unut:

- Yıldız puanlama / review widget
- "Trust badges" (Visa/Mastercard logo strip, SSL pin)
- Live chat widget (iletişim WhatsApp üzerinden)
- Newsletter popup ("ilk siparişinde %10 indirim!")
- Banner ad / promotional carousel
- Wheel-of-fortune / spin to win
- Cart abandonment exit-intent popup
- Re-targeting tracker pixels (Vercel Analytics yeterli)

Yukarıdakiler atelier hissini yıkar, conversion'a uzun vadede yardım etmez (mobilya = uzun-değerlendirme satın alma, dürtüsel değil).

## Sonuç

Şimşek'in commerce'ı Vivense / IKEA değil — atölye anlatısının dijital uzantısıdır. Kararlar her zaman "atelier'den müşteri ne hisseder?" sorusuna döner. Kırmızı kullanırız ama bağırmayız; KDV dahil fiyat veririz ama "FIRSAT!" pul'u yok. Bottom tab'da Sepet ve Ürünler var, ama Çalışmalarımız tek tıklamada hâlâ orada.

E-ticaret motoru, marka motorunun *üzerine* eklenir — yerine değil.
