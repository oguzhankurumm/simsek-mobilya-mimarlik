/**
 * Şimşek Mobilya & Mimarlık — atelier work.
 *
 * Görseller @simsekmobilya_ist hesabından alınmış. Açıklamalar atölyenin
 * Instagram'daki yazma diline (kısa, samimi, direkt — "Bir çalışmamız
 * daha..", "Şişli'de Müslüm bey'in evini yeniledik", "TEM Avrupa
 * Konutları 31. blok mutfak dolabı" tarzı) sadık şekilde yazıldı.
 *
 * Her proje /calismalar/[slug] (TR) ve /en/work/[slug] üzerinden yayınlanır.
 */

export type ProjectCategory =
  | "living"
  | "kitchen"
  | "bedroom"
  | "bathroom"
  | "office"
  | "architectural"
  | "renovation";

export interface ProjectImage {
  src: string;
  alt: string;
  width: number;
  height: number;
}

export interface Project {
  slug: string;
  category: ProjectCategory;
  /** Year delivered. */
  year: number;
  /** Optional ISO date for ordering — defaults to year-01-01 if absent. */
  date?: string;
  location: string;
  /** Original Instagram post URL — used for "see more" links. */
  igUrl?: string;
  titleTr: string;
  titleEn: string;
  summaryTr: string;
  summaryEn: string;
  storyTr: string;
  storyEn: string;
  scopeTr: string[];
  scopeEn: string[];
  materialsTr: string[];
  materialsEn: string[];
  cover: ProjectImage;
  gallery: ProjectImage[];
  featured?: boolean;
}

/* ────────────────────────────────────────────────────────
   Image dimension defaults — Instagram native portrait crops
   are typically 1440 × 1800; landscape covers come at ~1440 × 1080.
   We pass these so next/image can compute the layout without
   requesting the file head.
   ──────────────────────────────────────────────────────── */
const PORTRAIT = { width: 1440, height: 1800 } as const;
const LANDSCAPE = { width: 1440, height: 1080 } as const;

export const PROJECTS: Project[] = [
  {
    slug: "kadikoy-evi",
    category: "renovation",
    year: 2026,
    date: "2026-02-23",
    location: "Kadıköy, İstanbul",
    igUrl: "https://www.instagram.com/p/DVHOjJ2CHPQ/",
    titleTr: "Kadıköy Evi",
    titleEn: "Kadıköy Home",
    summaryTr:
      "Kadıköy'de bir evi baştan yeniledik. Salondan mutfağa, yatak odasından banyoya — her detayı atölyemizde yaptık.",
    summaryEn:
      "Renovated a Kadıköy home from end to end. From the salon to the kitchen, the bedroom to the bath — every detail built in our atelier.",
    storyTr:
      "Salona gömme şömine + 86\" TV ünitesi yaptık, iki yanına LED ışıklı kitaplık nişleri yerleştirdik. Yemek odasına üç kemerli vitrinli bar ünitesi geldi. Mutfağa klasik kalıplı krem kabin, masif meşe açık raf ve mermer tezgah uyguladık. Antre boyunca aynalı gardırob serisi + ahşap dilme tavan kuruldu. Yatak odasının başucuna LED'li boy ayna ile saklı makyaj çekmecesi entegre ettik. Banyoya yeşil dik seramik + yüzer lavabo dolabı. Tasarım, üretim, kurulum hepsi tek elden — 12 haftada teslim ettik.",
    storyEn:
      "We built an inset fireplace and an 86\" TV unit in the salon, with LED-lit library niches on either side. The dining room got a three-arch glass-shelved bar unit. The kitchen has classic-moulded cream cabinetry, solid-oak open shelves, and a marble countertop. A mirrored wardrobe run plus an oak-slat ceiling lines the entire hallway. In the master we integrated an LED-edged full-height mirror and a hidden vanity drawer above the headboard. The bath has vertical green-tile and a floating vanity. Design, build, and install all in-house — delivered in 12 weeks.",
    scopeTr: [
      "Salon — gömme şömine + TV ünitesi + ışıklı kitaplık",
      "Yemek odası — 3 kemerli vitrinli bar ünitesi",
      "Mutfak — klasik panel kabin + ada + masif meşe raf",
      "Antre — aynalı gardırob + ahşap dilme tavan",
      "Yatak odası — gardırop + ışıklı boy ayna + makyaj çekmecesi",
      "Banyo — yeşil seramik duşa kabin + lavabo dolabı",
    ],
    scopeEn: [
      "Salon — inset fireplace + TV unit + LED-lit library",
      "Dining — 3-arch glass-shelved bar unit",
      "Kitchen — classic panel cabinetry + island + solid-oak shelves",
      "Hallway — mirrored wardrobe + oak-slat ceiling",
      "Master suite — wardrobe + edge-lit mirror + vanity drawer",
      "Bathroom — green-tile shower + floating vanity",
    ],
    materialsTr: [
      "Krem klasik panel",
      "Masif meşe",
      "Beyaz ve krem mermer",
      "Pirinç + krom donanım",
      "Yeşil dik kalıp seramik",
      "LED entegre aydınlatma",
    ],
    materialsEn: [
      "Cream classic panel",
      "Solid oak",
      "White & cream marble",
      "Brass + chrome hardware",
      "Vertical green ceramic",
      "Integrated LED lighting",
    ],
    cover: {
      src: "/work/kadikoy-evi/01-salon-tv.jpg",
      alt: "Kadıköy salonu — gömme şömineli TV ünitesi, LED ışıklı yan kitaplıklar",
      ...PORTRAIT,
    },
    gallery: [
      {
        src: "/work/kadikoy-evi/02-yemek-odasi.jpg",
        alt: "Yemek odası — kemerli vitrinli bar ünitesi ve cam küre sarkıt aydınlatma",
        ...PORTRAIT,
      },
      {
        src: "/work/kadikoy-evi/03-bar-vitrin.jpg",
        alt: "Üç kemer detayı — yeşil LED ışıklı bar nişleri",
        ...PORTRAIT,
      },
      {
        src: "/work/kadikoy-evi/04-mutfak-detay.jpg",
        alt: "Mutfak — masif meşe açık raf, klasik panel kabin, mermer arka tezgah",
        ...PORTRAIT,
      },
      {
        src: "/work/kadikoy-evi/05-mutfak-ada.jpg",
        alt: "Mutfak detay — kaval cam vitrin kapakları, mermer tezgah, gizli aydınlatma",
        ...PORTRAIT,
      },
      {
        src: "/work/kadikoy-evi/06-antre-koridor.jpg",
        alt: "Antre — aynalı gardırob serisi ve ahşap dilme panel tavan",
        ...PORTRAIT,
      },
      {
        src: "/work/kadikoy-evi/07-detay.jpg",
        alt: "Salon detay — özel sehpa ve oturma grubu",
        ...PORTRAIT,
      },
      {
        src: "/work/kadikoy-evi/08-detay.jpg",
        alt: "Mekan detay — pirinç ve mermer doku diyaloğu",
        ...PORTRAIT,
      },
      {
        src: "/work/kadikoy-evi/09-yatak-makyaj.jpg",
        alt: "Yatak odası — LED'li boy ayna ve gizli makyaj çekmecesi entegre gardırob",
        ...PORTRAIT,
      },
      {
        src: "/work/kadikoy-evi/10-banyo.jpg",
        alt: "Banyo — yeşil dikey seramikli duşa kabin",
        ...PORTRAIT,
      },
    ],
    featured: true,
  },
  {
    slug: "catalca-konagi",
    category: "bedroom",
    year: 2025,
    date: "2025-11-18",
    location: "Çatalca, İstanbul",
    igUrl: "https://www.instagram.com/p/DRNPcrOiLRh/",
    titleTr: "Çatalca Konağı",
    titleEn: "Çatalca Residence",
    summaryTr:
      "Çatalca'daki bir konağın iki yatak odasına ısmarlama gardırop yaptık. Her ikisi de zeminden tavana, özel ölçü.",
    summaryEn:
      "Built bespoke wardrobes for two bedrooms of a Çatalca residence. Both floor-to-ceiling, made to exact measure.",
    storyTr:
      "İlk odaya beyaz mat lake klasik panel gardırop yaptık — her kapağın ortasında çerçeve kalıbı, çiftleri birleştiren uzun pirinç tutamaklar. İkinci odaya gri kaval (fluted) panel uyguladık — krom tutamaklı. İki gardırop da atölyemizde modüler üretildi, yerinde monte edildi.",
    storyEn:
      "The first room got a white matte-lacquer wardrobe with classic-moulded panel doors and long vertical brass pulls joining the door pairs. The second room got grey fluted (reeded) panels with brushed-chrome handles. Both wardrobes were built modular in our atelier and assembled on site.",
    scopeTr: [
      "Yatak odası 1 — beyaz lake klasik panel gardırop",
      "Yatak odası 2 — gri kaval panel gardırop",
      "İç çekmece + askılık düzenleri",
      "Pirinç ve krom dikey tutamaklar",
    ],
    scopeEn: [
      "Bedroom 1 — white lacquer classic-moulded wardrobe",
      "Bedroom 2 — grey fluted-panel wardrobe",
      "Internal drawer + hanging programs",
      "Brass and chrome vertical pulls",
    ],
    materialsTr: [
      "Beyaz mat lake",
      "Gri mat lake — kaval panel",
      "Pirinç tutamak",
      "Krom tutamak",
    ],
    materialsEn: [
      "White matte lacquer",
      "Grey matte lacquer — fluted",
      "Brass pulls",
      "Brushed chrome pulls",
    ],
    cover: {
      src: "/work/catalca-konagi/01-gardirob-beyaz.jpg",
      alt: "Çatalca konağı — beyaz klasik panel yatak odası gardırobu, pirinç dikey tutamaklar, ahşap parke zemin",
      ...PORTRAIT,
    },
    gallery: [
      {
        src: "/work/catalca-konagi/02-gardirob-gri.jpg",
        alt: "İkinci yatak odası — gri kaval panel gardırob, krom tutamaklar",
        ...PORTRAIT,
      },
    ],
    featured: true,
  },
  {
    slug: "avrupa-konutlari-tem-banyolari",
    category: "bathroom",
    year: 2025,
    date: "2025-05-03",
    location: "Avrupa Konutları TEM, İstanbul",
    igUrl: "https://www.instagram.com/p/DJLbC3SoAul/",
    titleTr: "TEM Avrupa Konutları — Banyo Dolapları",
    titleEn: "TEM Avrupa Konutları — Bathroom Vanities",
    summaryTr:
      "TEM Avrupa Konutları'nda aynı sitenin 8 ayrı dairesine banyo dolabı yaptık. Her biri farklı renk, farklı detay.",
    summaryEn:
      "Built bathroom vanities for 8 different units in the TEM Avrupa Konutları complex. Each one in a different colour, with its own detailing.",
    storyTr:
      "Lacivert kaval + pirinç tutamak, antrasit klasik kalıp, açık gri çerçeveli kapak, beyaz lake panel — her banyoya o banyonun atmosferine uygun bir dolap kurguladık. Yuvarlak LED'li aynalar, vessel lavabolar, mermer tezgahlar. Hepsi ölçüsü tek tek alınıp atölyemizde üretildi, yerinde monte edildi.",
    storyEn:
      "Navy fluted panels with brass pulls, anthracite classic mouldings, soft-grey framed doors, white lacquer panels — each bathroom got a vanity tuned to its own atmosphere. Round LED-edged mirrors, vessel basins, marble countertops. Every piece measured one-by-one, built in our atelier, installed on site.",
    scopeTr: [
      "8 farklı banyoya bağımsız tasarım + üretim",
      "Mermer tezgah + vessel lavabo",
      "Yuvarlak LED'li ayna",
      "Yumuşak kapanan çekmece sistemi",
    ],
    scopeEn: [
      "Independent design + build for 8 different bathrooms",
      "Marble countertops + vessel basins",
      "Round LED-edged mirrors",
      "Soft-close drawer systems",
    ],
    materialsTr: [
      "Lacivert + antrasit + açık gri mat lake",
      "Beyaz mat lake klasik panel",
      "Mermer tezgah",
      "Pirinç + mat siyah donanım",
    ],
    materialsEn: [
      "Navy + anthracite + soft-grey matte lacquer",
      "White lacquered classic panel",
      "Marble counters",
      "Brass + matte-black hardware",
    ],
    cover: {
      src: "/work/avrupa-konutlari/03-banyo-lacivert-1.jpg",
      alt: "Avrupa Konutları — lacivert kaval banyo dolabı, yuvarlak LED'li ayna, vessel lavabo, pirinç donanım",
      ...PORTRAIT,
    },
    gallery: [
      {
        src: "/work/avrupa-konutlari/04-banyo-lacivert-2.jpg",
        alt: "Lacivert banyo — yan açıdan ayna ve lavabo detayı",
        ...PORTRAIT,
      },
      {
        src: "/work/avrupa-konutlari/01-banyo-gri.jpg",
        alt: "Klasik gri panel banyo — pirinç tutamaklı yüzer dolap, yuvarlak LED ayna",
        ...PORTRAIT,
      },
      {
        src: "/work/avrupa-konutlari/02-banyo-beyaz.jpg",
        alt: "Beyaz klasik panel banyo dolabı",
        ...PORTRAIT,
      },
      {
        src: "/work/avrupa-konutlari/05-banyo-kaval.jpg",
        alt: "Antrasit kaval panel banyo dolabı, üst dolap LED'li",
        ...PORTRAIT,
      },
      {
        src: "/work/avrupa-konutlari/06-banyo-antrasit.jpg",
        alt: "Antrasit kaval lavabo dolabı, krom tutamaklar",
        ...PORTRAIT,
      },
      {
        src: "/work/avrupa-konutlari/07-banyo-mozaik.jpg",
        alt: "Antrasit dolap + altıgen mozaik zemin banyo",
        ...PORTRAIT,
      },
      {
        src: "/work/avrupa-konutlari/08-banyo-detay.jpg",
        alt: "Lacivert lavabo dolabı detay — pirinç çubuk tutamak, beyaz vessel lavabo",
        ...LANDSCAPE,
      },
    ],
    featured: true,
  },
];

export const FEATURED_PROJECTS = PROJECTS.filter((p) => p.featured);

/* ────────────────────────────────────────────────────────
   Categories — every project lands under one of these.
   The filter chip list on /calismalar is generated from this
   array; categories with zero projects still render so visitors
   can see the studio's full range — clicking shows a polite
   "no projects yet" message.
   ──────────────────────────────────────────────────────── */
export const PROJECT_CATEGORIES: { key: ProjectCategory; labelTr: string; labelEn: string }[] = [
  { key: "renovation", labelTr: "Ev Yenileme", labelEn: "Renovation" },
  { key: "bedroom", labelTr: "Yatak Odası", labelEn: "Bedroom" },
  { key: "bathroom", labelTr: "Banyo", labelEn: "Bathroom" },
  { key: "kitchen", labelTr: "Mutfak", labelEn: "Kitchen" },
  { key: "living", labelTr: "Salon", labelEn: "Living" },
  { key: "office", labelTr: "Ofis", labelEn: "Office" },
  { key: "architectural", labelTr: "Mimari Proje", labelEn: "Architectural" },
];

export function getProjectBySlug(slug: string): Project | undefined {
  return PROJECTS.find((p) => p.slug === slug);
}

export function getNextProject(slug: string): Project {
  const idx = PROJECTS.findIndex((p) => p.slug === slug);
  return PROJECTS[(idx + 1) % PROJECTS.length];
}
