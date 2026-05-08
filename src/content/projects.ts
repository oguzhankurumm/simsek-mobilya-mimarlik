/**
 * Şimşek Mobilya & Mimarlık — atelier work.
 * Photographs ve görseller @simsekmobilya_ist Instagram hesabından alınmış,
 * `/public/work/<slug>/` altında local olarak saklanıyor. Yeni proje
 * eklemek için: görselleri `/public/work/<yeni-slug>/` klasörüne koy ve
 * aşağıdaki PROJECTS dizisine yeni bir Project entry'si ekle.
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
    titleTr: "Kadıköy Evi — Tam Yenileme",
    titleEn: "Kadıköy Residence — Full Renovation",
    summaryTr:
      "Bir aile evinin tüm odaları için kurgulanan ısmarlama program: salondan mutfağa, yatak odasından banyoya tek bir mimari grameri.",
    summaryEn:
      "A bespoke program for every room of a family home: from salon to kitchen, bedroom to bathroom, all under one architectural grammar.",
    storyTr:
      "Kadıköy'deki bu daireyi temelden ele aldık. Salonun ekseninde gömme şömine + 86\" TV ünitesi, iki yanda LED entegre kitaplık nişleri kuruldu. Yemek odasına geçişte üç kemerli vitrinli bar ünitesi yerleştirildi; iç camlı raflar yeşil LED ile ışıklandırıldı. Mutfakta klasik kalıplı krem kabin, masif meşe açık raf serisi ve mermer tezgah üçlüsü dengelendi. Antreyi koridor boyunca aynalı gardırob serisiyle uzattık, tavanı ahşap dilme panellerle yumuşattık. Yatak odasının başucu duvarına LED'li boy ayna + saklı makyaj çekmecesi entegre edildi. Banyoda yeşil dik kalıp seramikle akustik bir köşe oluşturuldu. Tasarım, üretim ve kurulum 12 hafta içinde tamamlandı.",
    storyEn:
      "We rebuilt this Kadıköy apartment from the slab. The salon's spine carries an inset fireplace and 86\" TV unit, flanked by LED-lit library niches. A three-arch glass-shelved bar unit anchors the dining room — emerald LED back-lighting echoes the salon's library glow. The kitchen balances classic-moulded cream cabinetry with solid-oak open shelving and a marble countertop. The hallway was lengthened with a mirrored wardrobe run; an oak-slat ceiling softens the corridor. In the master, an LED-edged full-height mirror and a concealed vanity drawer integrate into the headboard wall. A vertical green-tile shower stall completes the en-suite. Design, build, and install delivered in 12 weeks.",
    scopeTr: [
      "Salon mimarisi: gömme şömine + TV ünitesi + ışıklı kitaplık",
      "Yemek odası: kemerli vitrinli bar ünitesi (3 nişli)",
      "Klasik panel mutfak: kabin + ada + açık masif meşe raf",
      "Antre/koridor: aynalı gardırob serisi + ahşap panel tavan",
      "Master yatak odası: gardırob + ışıklı boy ayna + makyaj çekmecesi",
      "Banyo: yeşil dikey seramik duşa kabin + ısmarlama lavabo dolabı",
    ],
    scopeEn: [
      "Salon: inset fireplace + TV unit + LED-lit library",
      "Dining: three-arch glass-shelved bar unit",
      "Classic-moulded kitchen: cabinetry + island + solid-oak open shelves",
      "Hallway: mirrored wardrobe run + oak-slat ceiling",
      "Master suite: wardrobe + edge-lit mirror + concealed vanity drawer",
      "Bathroom: vertical green-tile shower + bespoke vanity",
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
    titleTr: "Çatalca Konağı — Yatak Odası Gardıropları",
    titleEn: "Çatalca Mansion — Bedroom Wardrobes",
    summaryTr:
      "Bir konağın iki yatak odası için tasarlanan, zeminden tavana özel ölçü gardıroplar. Klasik panel detayları, pirinç ve krom donanım.",
    summaryEn:
      "Floor-to-ceiling, made-to-measure wardrobes for two bedrooms in a Çatalca mansion. Classic-moulded detailing, brass and chrome hardware.",
    storyTr:
      "Çatalca'daki konağın iki ayrı yatak odası için ısmarlama gardırob programları kurguladık. İlk odada, parke zemine konuşan saf beyaz mat lake panel kapaklar — her panelin merkezinde klasik çerçeve kalıbı, kapak çiftlerini birleştiren uzun pirinç dikey tutamaklar. İkinci odada ise serin gri tonunda striped (kaval) panel detayı; kaval kalıplar tavana doğru genişleyerek aşağıdaki krom tutamaklara akıyor. Her iki gardırob da atölyemizde modüler bir şekilde üretilip yerinde bütünlendi.",
    storyEn:
      "We designed bespoke wardrobe programs for two separate bedrooms in this Çatalca mansion. The first room: pure white matte-lacquer panel doors against the timber floor — each panel framed with a classic profile, paired doors joined by tall vertical brass pulls. The second room: cool-grey fluted panels with vertical reeding that flows up to the ceiling and meets brushed-chrome handles below. Both wardrobes were modularly built in our atelier and finished in place.",
    scopeTr: [
      "Yatak odası 1 — beyaz lake klasik panel gardırob",
      "Yatak odası 2 — gri kaval (fluted) panel gardırob",
      "Saklı iç çekmece + askılık programları",
      "Pirinç ve krom uzun tutamaklar",
    ],
    scopeEn: [
      "Bedroom 1 — white-lacquer classic-moulded wardrobe",
      "Bedroom 2 — grey fluted-panel wardrobe",
      "Concealed drawers + hanging program inside",
      "Long brass and chrome pull handles",
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
    titleTr: "Avrupa Konutları TEM — Banyo Programı",
    titleEn: "Avrupa Konutları TEM — Bathroom Program",
    summaryTr:
      "Aynı sitenin sekiz farklı banyosu için kurgulanan ısmarlama dolap serisi. Lacivert, antrasit, açık gri ve klasik beyaz paletler — her birinde aydınlatma, ayna ve donanım üçlüsü dengelenmiş.",
    summaryEn:
      "A bespoke bathroom-cabinetry series for eight individual bathrooms in the same complex. Navy, anthracite, soft-grey, and classic-white palettes — each balanced on the triad of lighting, mirror, and hardware.",
    storyTr:
      "Avrupa Konutları TEM'de aynı sitenin sekiz farklı dairesinin banyoları için sekiz ayrı banyo dolabı tasarladık. Her banyo bağımsız bir kurgu — lacivert kaval panel + pirinç tutamak; antrasit klasik kalıp; açık gri çerçeveli kapak; kaval cam vitrin + altıgen mozaik. Yuvarlak LED'li aynalar mat seramik duvarlarda yumuşak bir aura yaratırken, vessel lavabolar mermer tezgahta heykelsi durur. Her dolap, ölçüsü alınan banyo için tek tek atölyede üretildi.",
    storyEn:
      "Eight bathrooms in eight different units across the Avrupa Konutları TEM complex — eight bespoke vanities. Each is its own composition: navy fluted panels with brass pulls; anthracite classic-mould; soft-grey framed doors; reeded-glass cabinets above hexagonal mosaic. Round LED-edged mirrors cast a soft aura on matte porcelain walls, while vessel basins sit sculptural on the marble counters. Every cabinet was built one-by-one in our atelier to the exact measurements of its bathroom.",
    scopeTr: [
      "8 ayrı banyo için bağımsız tasarım + üretim",
      "Vessel lavabolu mermer tezgahlar",
      "Yuvarlak LED'li ayna programları",
      "Akustik askılı çekmece sistemleri",
    ],
    scopeEn: [
      "Independent design + build for 8 distinct bathrooms",
      "Marble counters with vessel basins",
      "Round LED-edged mirror programs",
      "Soft-close hanging drawer systems",
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
