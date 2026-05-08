/**
 * Şimşek Mobilya & Mimarlık — Site-wide configuration.
 * Single source of truth for brand info, contact channels, social links.
 * All other modules import from here so brand updates touch one file.
 */

export const SITE = {
  name: "Şimşek Mobilya & Mimarlık",
  shortName: "Şimşek Mobilya",
  legalName: "Şimşek Mobilya & Mimarlık",
  domain: "simsekmobilya.com",
  url:
    process.env.NEXT_PUBLIC_SITE_URL || "https://simsekmobilya.com",
  foundedYear: 1997,
  experienceYears: 28,
  taglineTr: "Özel tasarım mobilya. Eviniz, atölyemizden.",
  taglineEn: "Custom-crafted furniture. Your home, from our atelier.",
  descriptionTr:
    "28 yılı aşkın tecrübemizle özel tasarım mobilya üretiyoruz. Mimari ekibimizle evinizi yeniliyoruz.",
  descriptionEn:
    "Custom-designed furniture for over 28 years. Our architectural team renovates homes with editorial restraint and material honesty.",
} as const;

export const CONTACT = {
  phone: "+90 532 646 39 19",
  phoneDisplay: "0 (532) 646 39 19",
  phoneE164: "+905326463919",
  whatsapp: "+905326463919",
  email: "info@simsekmobilya.com",
  address: {
    streetTr: "Atölye & Showroom",
    streetEn: "Atelier & Showroom",
    city: "İstanbul",
    country: "Türkiye",
    countryCode: "TR",
  },
  hours: {
    weekdaysTr: "Pazartesi – Cumartesi · 09:00 – 19:00",
    weekdaysEn: "Monday – Saturday · 9:00 AM – 7:00 PM",
    sundayTr: "Pazar · Randevu ile",
    sundayEn: "Sunday · By appointment",
  },
} as const;

/**
 * WhatsApp click-to-chat — pre-filled mesaj sürtünmeyi azaltıyor:
 * müşteri sayfayı görüp tıkladığında ne yazacağını düşünmek yerine
 * direkt göndermeye odaklanıyor.
 */
const WA_DEFAULT_TEXT = encodeURIComponent(
  "Merhaba, simsekmobilya.com sitenizden ulaşıyorum. Projem için bilgi almak istiyorum."
);

export const SOCIAL = {
  instagram: {
    handle: "simsekmobilya_ist",
    url: "https://www.instagram.com/simsekmobilya_ist/",
    label: "Instagram",
  },
  whatsapp: {
    url: `https://wa.me/${CONTACT.whatsapp.replace("+", "")}?text=${WA_DEFAULT_TEXT}`,
    label: "WhatsApp",
  },
} as const;

export const NAV_ITEMS = [
  { href: "/portfolio", labelTr: "Çalışmalarımız", labelEn: "Work" },
  { href: "/services", labelTr: "Hizmetler", labelEn: "Services" },
  { href: "/about", labelTr: "Hakkımızda", labelEn: "About" },
  { href: "/contact", labelTr: "İletişim", labelEn: "Contact" },
] as const;

export const STATS = [
  {
    valueTr: "28+",
    valueEn: "28+",
    labelTr: "Yıllık Tecrübe",
    labelEn: "Years of Craft",
  },
  {
    valueTr: "1.200+",
    valueEn: "1,200+",
    labelTr: "Tamamlanan Proje",
    labelEn: "Projects Delivered",
  },
  {
    valueTr: "100%",
    valueEn: "100%",
    labelTr: "Özel Tasarım",
    labelEn: "Custom Made",
  },
  {
    valueTr: "İstanbul",
    valueEn: "İstanbul",
    labelTr: "Atölye Merkezi",
    labelEn: "Atelier Hub",
  },
] as const;
