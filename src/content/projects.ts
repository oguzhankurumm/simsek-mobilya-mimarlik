/**
 * Studio projects — replace `image` URLs with real Şimşek photographs
 * (e.g. local `/work/<slug>.jpg` or Vercel Blob URLs) when available.
 *
 * Each entry lives at /calismalar/[slug] (TR) and /en/work/[slug].
 * Categories drive the filter chips on the listing page.
 */

export type ProjectCategory =
  | "living"
  | "kitchen"
  | "bedroom"
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
  year: number;
  location: string;
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

const u = (id: string, w = 1600, h = 1100, q = 80) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}&h=${h}&q=${q}`;

export const PROJECTS: Project[] = [
  {
    slug: "atelye-besiktas",
    category: "living",
    year: 2025,
    location: "Beşiktaş, İstanbul",
    titleTr: "Atölye Beşiktaş Konağı",
    titleEn: "Atelier Beşiktaş Residence",
    summaryTr:
      "Bir aile yadigârı konağın çağdaş yorumla yeniden hayat bulması. Özel masif meşe ünite, mimari aydınlatma kurgusu ve ısmarlama oturma grupları.",
    summaryEn:
      "A family-heirloom mansion reinterpreted with contemporary restraint. Custom solid-oak millwork, architectural lighting, and a bespoke seating program.",
    storyTr:
      "Beşiktaş'taki üç kuşaklık konağı, mevcut kabuğu koruyarak iç çekirdeği yeniden kurguladık. Salonun ana ekseninde yer alan masif meşe duvar ünitesi, atölyemizde tek parça halinde üretildi; yerinde kuruldu. Aileye ait antika parçalar, yeni döşeme paletiyle diyaloga sokuldu.",
    storyEn:
      "We preserved the historic shell of a three-generation Beşiktaş mansion while re-architecting the inner core. The solid-oak feature wall on the salon's primary axis was hand-built in our atelier as a single unit and installed in place. The family's heirloom pieces enter dialogue with a new upholstery palette.",
    scopeTr: [
      "Salon ve aile odası mimari proje",
      "Ismarlama duvar ünitesi (masif meşe)",
      "Oturma grubu tasarımı ve üretimi",
      "Mimari aydınlatma kurgusu",
    ],
    scopeEn: [
      "Salon & family-room architectural design",
      "Custom feature wall (solid oak)",
      "Bespoke seating program",
      "Architectural lighting concept",
    ],
    materialsTr: ["Masif meşe", "Kaşmir döşeme", "Pirinç detay", "Mermer"],
    materialsEn: ["Solid oak", "Cashmere upholstery", "Brass detail", "Marble"],
    cover: {
      src: u("1618221195710-dd6b41faaea6", 1800, 1200),
      alt: "Beşiktaş konağı oturma alanı — masif meşe duvar ünitesi ve antika piano",
      width: 1800,
      height: 1200,
    },
    gallery: [
      { src: u("1618221195710-dd6b41faaea6", 1600, 1067), alt: "Salon paneli detayı", width: 1600, height: 1067 },
      { src: u("1567016526105-22da7c13161a", 1600, 2000), alt: "Aile odası", width: 1600, height: 2000 },
      { src: u("1556909114-f6e7ad7d3136", 1600, 1067), alt: "Mutfak", width: 1600, height: 1067 },
    ],
    featured: true,
  },
  {
    slug: "minimal-ev-nisantasi",
    category: "renovation",
    year: 2024,
    location: "Nişantaşı, İstanbul",
    titleTr: "Minimal Ev — Nişantaşı",
    titleEn: "Minimal House — Nişantaşı",
    summaryTr:
      "210 m² dairenin tam kapsamlı yenilenmesi. Saklı depolama, sürekli zemin ve yumuşak akustik perdeler.",
    summaryEn:
      "Full-floor renovation of a 210 m² apartment. Concealed storage, continuous flooring, and soft acoustic curtains.",
    storyTr:
      "Mevcut bölme duvarları kaldırıp loft duyumsamasını yakaladık. Yatay çizgi mantığını koruyan TV ünitesi, kitap rafı ve mutfak ünitesi tek bir gramerde tasarlandı. Sahip olduğunuz hissi konuşan, sahip olunduğu hissi reddeden bir mekân.",
    storyEn:
      "We removed existing partitions to capture a loft sensibility. The horizontal logic ties together the TV unit, library, and kitchen as a single design grammar — a space that speaks of being inhabited, not staged.",
    scopeTr: [
      "Tam kapsamlı yenileme",
      "Saklı depolama mimarisi",
      "Mutfak ve banyo tasarımı",
      "Akustik tasarım",
    ],
    scopeEn: [
      "Full renovation",
      "Concealed-storage architecture",
      "Kitchen & bath design",
      "Acoustic treatment",
    ],
    materialsTr: ["Beyaz dut", "Travertin", "Yün halı", "Mat siyah metal"],
    materialsEn: ["White mulberry", "Travertine", "Wool rug", "Matte black steel"],
    cover: {
      src: u("1505691938895-1758d7feb511", 1800, 1200),
      alt: "Nişantaşı minimal salon",
      width: 1800,
      height: 1200,
    },
    gallery: [
      { src: u("1505691938895-1758d7feb511", 1600, 1067), alt: "Salon", width: 1600, height: 1067 },
      { src: u("1493663284031-b7e3aefcae8e", 1600, 1067), alt: "Mutfak", width: 1600, height: 1067 },
      { src: u("1540518614846-7eded433c457", 1600, 2000), alt: "Yatak odası", width: 1600, height: 2000 },
    ],
    featured: true,
  },
  {
    slug: "merdiven-evi",
    category: "architectural",
    year: 2024,
    location: "Sarıyer, İstanbul",
    titleTr: "Merdiven Evi",
    titleEn: "Stair House",
    summaryTr:
      "Üç katlı yamaç evinin merkezinde yer alan ahşap merdiven, sirkülasyonu sergi mekânına dönüştürür.",
    summaryEn:
      "Set at the spine of a three-storey hillside home, a sculpted timber stair turns circulation into a gallery.",
    storyTr:
      "Yamaç eviyle gelen kot farkı, üç katı bağlayan çam merdiven heykeline dönüştü. Korkuluksuz, monolitik bir form. Her basamak parçası atölyede CNC ile şekillendirildi, elde mat finiş aldı.",
    storyEn:
      "The hillside's level difference became a pine sculpture connecting three storeys. A monolithic, balustrade-free form — each step CNC-shaped in the atelier and hand-finished to a matte glow.",
    scopeTr: [
      "Mimari proje",
      "Heykel merdiven tasarımı ve üretimi",
      "Saklı korkuluk sistemi",
      "Aydınlatma entegrasyonu",
    ],
    scopeEn: [
      "Architectural design",
      "Sculpted-stair design & build",
      "Concealed handrail system",
      "Integrated lighting",
    ],
    materialsTr: ["Karadeniz çamı", "Brüt beton", "Cam"],
    materialsEn: ["Black-Sea pine", "Raw concrete", "Glass"],
    cover: {
      src: u("1554995207-c18c203602cb", 1800, 1200),
      alt: "Mimari ahşap merdiven",
      width: 1800,
      height: 1200,
    },
    gallery: [
      { src: u("1554995207-c18c203602cb", 1600, 1067), alt: "Merdiven", width: 1600, height: 1067 },
      { src: u("1600585154340-be6161a56a0c", 1600, 1067), alt: "Cephe", width: 1600, height: 1067 },
      { src: u("1572025442646-866d16c84a54", 1600, 2000), alt: "Detay", width: 1600, height: 2000 },
    ],
    featured: true,
  },
  {
    slug: "atolye-mutfak-bodrum",
    category: "kitchen",
    year: 2024,
    location: "Yalıkavak, Bodrum",
    titleTr: "Atölye Mutfak — Bodrum",
    titleEn: "Atelier Kitchen — Bodrum",
    summaryTr:
      "Akdeniz ışığında pişen bir mutfak. Adada doğal taş, gizli buzdolabı ve atölye yapımı yağlık.",
    summaryEn:
      "A kitchen baked in Mediterranean light. Natural stone island, concealed refrigeration, atelier-built oil cabinet.",
    storyTr:
      "Yalıkavak'taki yazlık evin kalbinde, çok jenerasyonlu bir aile için kurgulanmış mutfak. Krem mermerle çevrili ada, pişirme ve buluşmayı tek bir gramerde toplar.",
    storyEn:
      "At the heart of a Yalıkavak summer house, a kitchen orchestrated for a multigenerational family. The cream-marble island merges cooking and gathering into one grammar.",
    scopeTr: ["Mutfak mimarisi", "Ada ve dolap üretimi", "Doğal havalandırma"],
    scopeEn: ["Kitchen architecture", "Island & cabinetry build", "Natural ventilation"],
    materialsTr: ["Krem mermer", "Beyaz meşe", "Mat seramik", "Pirinç"],
    materialsEn: ["Cream marble", "White oak", "Matte ceramic", "Brass"],
    cover: {
      src: u("1556909114-f6e7ad7d3136", 1800, 1200),
      alt: "Bodrum atölye mutfak",
      width: 1800,
      height: 1200,
    },
    gallery: [
      { src: u("1556909114-f6e7ad7d3136", 1600, 1067), alt: "Mutfak", width: 1600, height: 1067 },
      { src: u("1565183997392-2f6f122e5912", 1600, 1067), alt: "Ada detay", width: 1600, height: 1067 },
    ],
  },
  {
    slug: "kutuphane-evi",
    category: "living",
    year: 2023,
    location: "Bebek, İstanbul",
    titleTr: "Kütüphane Evi",
    titleEn: "Library House",
    summaryTr:
      "Boğaz manzaralı dairenin salonunu zeminden tavana ahşap kütüphaneye dönüştürdük.",
    summaryEn:
      "We turned the salon of a Bosphorus-view apartment into a floor-to-ceiling timber library.",
    storyTr:
      "Müşterinin 4.000 kitaplık koleksiyonu için tasarlanan kütüphane, salonun iki tam duvarını kaplar. Hareketli merdiven, gizli bar ve oturma nişleri ile çok katmanlı.",
    storyEn:
      "Designed for a 4,000-volume collection, the library wraps two full walls of the salon. A rolling ladder, concealed bar, and reading niches make it multi-layered.",
    scopeTr: ["Kütüphane tasarımı ve üretimi", "Hareketli merdiven sistemi", "Gizli bar"],
    scopeEn: ["Library design & build", "Rolling-ladder system", "Concealed bar"],
    materialsTr: ["Amerikan ceviz", "Pirinç", "Deri raf detay"],
    materialsEn: ["American walnut", "Brass", "Leather shelf-edge"],
    cover: {
      src: u("1507473885765-e6ed057f782c", 1800, 1200),
      alt: "Bebek kütüphane evi",
      width: 1800,
      height: 1200,
    },
    gallery: [
      { src: u("1507473885765-e6ed057f782c", 1600, 1067), alt: "Kütüphane", width: 1600, height: 1067 },
    ],
  },
  {
    slug: "ofis-galata",
    category: "office",
    year: 2023,
    location: "Galata, İstanbul",
    titleTr: "Galata Ofisi",
    titleEn: "Galata Office",
    summaryTr:
      "Tarihi bir handa avukatlık bürosu için kurgulanan, masif ahşap ve nişler etrafında dönen sakin ofis.",
    summaryEn:
      "A law firm in a historic han, anchored by solid timber, cabinetry niches, and acoustic restraint.",
    storyTr:
      "Tarihi yapının sıvası ve tuğlasıyla diyalog kuran modüler ofis ünitesi atölyemizde önceden monte edildi, yerinde tek parça olarak yerleştirildi.",
    storyEn:
      "A modular office unit dialoguing with the historic plaster and brick, pre-assembled in our atelier and installed as a single piece on-site.",
    scopeTr: ["Ofis mimarisi", "Akustik tasarım", "Modüler depolama", "Toplantı masası"],
    scopeEn: ["Office architecture", "Acoustic design", "Modular storage", "Conference table"],
    materialsTr: ["Doğal ceviz", "Mat çelik", "Yün kumaş paneli"],
    materialsEn: ["Natural walnut", "Matte steel", "Wool acoustic panels"],
    cover: {
      src: u("1497366216548-37526070297c", 1800, 1200),
      alt: "Galata ofisi",
      width: 1800,
      height: 1200,
    },
    gallery: [
      { src: u("1497366216548-37526070297c", 1600, 1067), alt: "Ofis", width: 1600, height: 1067 },
    ],
  },
  {
    slug: "yatak-odasi-yenikoy",
    category: "bedroom",
    year: 2023,
    location: "Yeniköy, İstanbul",
    titleTr: "Yeniköy Master Yatak Odası",
    titleEn: "Yeniköy Master Suite",
    summaryTr:
      "İki çocuklu bir aile için tasarlanan ana yatak odası ve giyinme odası; saklı çekmece programı.",
    summaryEn:
      "A master suite and dressing room for a family of four; a concealed drawer program runs the back wall.",
    storyTr:
      "Master yatak odası ve giyinme odası tek bir gramerle tasarlandı. Başucu duvarı, yumuşak yün dokulu paneliyle akustik bir sırt sunar.",
    storyEn:
      "Master bedroom and dressing room share a single grammar. The headboard wall offers an acoustic spine in soft wool panelling.",
    scopeTr: ["Yatak odası mimarisi", "Giyinme odası", "Başucu duvarı"],
    scopeEn: ["Bedroom architecture", "Dressing room", "Headboard wall"],
    materialsTr: ["Yün kumaş", "Beyaz dut", "Mat altın detay"],
    materialsEn: ["Wool textile", "White mulberry", "Matte gold detail"],
    cover: {
      src: u("1540518614846-7eded433c457", 1800, 1200),
      alt: "Yeniköy yatak odası",
      width: 1800,
      height: 1200,
    },
    gallery: [
      { src: u("1540518614846-7eded433c457", 1600, 1067), alt: "Yatak odası", width: 1600, height: 1067 },
    ],
  },
  {
    slug: "salon-acibadem",
    category: "living",
    year: 2022,
    location: "Acıbadem, İstanbul",
    titleTr: "Salon — Acıbadem",
    titleEn: "Salon — Acıbadem",
    summaryTr:
      "Geniş bir aile salonu için hassas oturma grubu, oyun masası ve mimari kabuk.",
    summaryEn:
      "A precise seating program, gaming table, and architectural envelope for a generous family salon.",
    storyTr:
      "Üç jenerasyonun birlikte zaman geçirdiği salon için ölçek, sıcaklık ve akustik üçlüsünde dengelenmiş bir tasarım.",
    storyEn:
      "A salon for three generations, balanced on the triad of scale, warmth, and acoustic comfort.",
    scopeTr: ["Salon kurgusu", "Oturma grubu", "Sehpa & yan masalar"],
    scopeEn: ["Salon program", "Seating", "Coffee & side tables"],
    materialsTr: ["Keten", "Doğal ceviz", "El dokuma halı"],
    materialsEn: ["Linen", "Natural walnut", "Hand-loom rug"],
    cover: {
      src: u("1493809842364-78817add7ffb", 1800, 1200),
      alt: "Acıbadem salonu",
      width: 1800,
      height: 1200,
    },
    gallery: [
      { src: u("1493809842364-78817add7ffb", 1600, 1067), alt: "Salon", width: 1600, height: 1067 },
    ],
  },
  {
    slug: "yali-mutfagi",
    category: "kitchen",
    year: 2022,
    location: "Kanlıca, İstanbul",
    titleTr: "Yalı Mutfağı — Kanlıca",
    titleEn: "Yalı Kitchen — Kanlıca",
    summaryTr:
      "Tarihi yalının mutfağı, yapı kabuğunu koruyarak yeniden tasarlandı.",
    summaryEn:
      "The kitchen of a historic Bosphorus yalı, reimagined while preserving its envelope.",
    storyTr:
      "Yalının ahşap kirişlerini ve döşemesini onarıp koruyarak, mutfak adasını ve duvar ünitesini bu çerçeveyle uyumlu yumuşak bir paletle kurguladık.",
    storyEn:
      "We restored the yalı's timber beams and floors, then composed the island and wall units in a soft palette that defers to the historic envelope.",
    scopeTr: ["Mutfak mimarisi", "Restorasyon koordinasyonu"],
    scopeEn: ["Kitchen architecture", "Restoration coordination"],
    materialsTr: ["Yıkanmış meşe", "Krem mermer", "Mat seramik"],
    materialsEn: ["Limewashed oak", "Cream marble", "Matte ceramic"],
    cover: {
      src: u("1556228720-195a672e8a03", 1800, 1200),
      alt: "Kanlıca yalı mutfağı",
      width: 1800,
      height: 1200,
    },
    gallery: [
      { src: u("1556228720-195a672e8a03", 1600, 1067), alt: "Mutfak", width: 1600, height: 1067 },
    ],
  },
  {
    slug: "stüdyo-cihangir",
    category: "renovation",
    year: 2022,
    location: "Cihangir, İstanbul",
    titleTr: "Stüdyo — Cihangir",
    titleEn: "Studio — Cihangir",
    summaryTr:
      "65 m² stüdyo dairenin akıllı tasarımı: katlanır yatak, gizli depolama, çok işlevli mutfak.",
    summaryEn:
      "Smart design for a 65 m² studio: a fold-down bed, concealed storage, multi-purpose kitchen.",
    storyTr:
      "Cihangir'in karakteristik dar düzeninde, gün ve gece kullanımını esnek bir mimariyle çözen küçük ölçek deneyi.",
    storyEn:
      "An experiment in small-footprint living within Cihangir's characteristic narrow plan — day and night reconfigured by a flexible architecture.",
    scopeTr: ["Stüdyo mimarisi", "Katlanır yatak ünitesi", "Mutfak"],
    scopeEn: ["Studio architecture", "Fold-down bed unit", "Kitchen"],
    materialsTr: ["Birch kontrplak", "Mat siyah metal", "Mantar zemin"],
    materialsEn: ["Birch ply", "Matte black steel", "Cork floor"],
    cover: {
      src: u("1502672260266-1c1ef2d93688", 1800, 1200),
      alt: "Cihangir stüdyo",
      width: 1800,
      height: 1200,
    },
    gallery: [
      { src: u("1502672260266-1c1ef2d93688", 1600, 1067), alt: "Stüdyo", width: 1600, height: 1067 },
    ],
  },
  {
    slug: "ev-ofis-etiler",
    category: "office",
    year: 2022,
    location: "Etiler, İstanbul",
    titleTr: "Ev-Ofis — Etiler",
    titleEn: "Home-Office — Etiler",
    summaryTr:
      "Çift kullanıcılı ev ofisi: gizli kablo yönetimi, mimari kitaplık, ses yalıtımlı toplantı köşesi.",
    summaryEn:
      "A two-user home office: concealed cable management, an architectural library, a sound-insulated meeting nook.",
    storyTr:
      "Pandemi sonrası kalıcı ev ofisi ihtiyacı için tasarlanan bu çalışma mekânı, salonla aynı paletten konuşur ama sınırlarını net çizer.",
    storyEn:
      "A permanent post-pandemic home office that speaks the salon's palette but draws clear boundaries.",
    scopeTr: ["Ev ofisi mimarisi", "Kitaplık ve depolama", "Akustik panel"],
    scopeEn: ["Home-office architecture", "Library & storage", "Acoustic panels"],
    materialsTr: ["Doğal meşe", "Yün panel", "Mat çelik"],
    materialsEn: ["Natural oak", "Wool panel", "Matte steel"],
    cover: {
      src: u("1631679706909-1844bbd07221", 1800, 1200),
      alt: "Etiler ev ofisi",
      width: 1800,
      height: 1200,
    },
    gallery: [
      { src: u("1631679706909-1844bbd07221", 1600, 1067), alt: "Ev ofisi", width: 1600, height: 1067 },
    ],
  },
  {
    slug: "yatak-odasi-suadiye",
    category: "bedroom",
    year: 2021,
    location: "Suadiye, İstanbul",
    titleTr: "Suadiye Yatak Odası",
    titleEn: "Suadiye Bedroom",
    summaryTr:
      "Genç bir çift için uyku-okuma-giyinme üçgenine kurgulanmış sade ve sıcak yatak odası.",
    summaryEn:
      "A simple, warm bedroom built around a sleep–read–dress triangle for a young couple.",
    storyTr:
      "Yatak odasının kalbi, bütünüyle elde döşenmiş başucu duvarıdır. Yan masaların hafifliğiyle paneli dengeledik.",
    storyEn:
      "The heart of the bedroom is a fully hand-upholstered headboard wall; the lightness of the side tables balances its volume.",
    scopeTr: ["Yatak odası mimarisi", "Giyinme dolabı"],
    scopeEn: ["Bedroom architecture", "Wardrobe"],
    materialsTr: ["El dokuma kumaş", "Mat ceviz", "Pirinç"],
    materialsEn: ["Hand-loom textile", "Matte walnut", "Brass"],
    cover: {
      src: u("1505693416388-ac5ce068fe85", 1800, 1200),
      alt: "Suadiye yatak odası",
      width: 1800,
      height: 1200,
    },
    gallery: [
      { src: u("1505693416388-ac5ce068fe85", 1600, 1067), alt: "Yatak odası", width: 1600, height: 1067 },
    ],
  },
];

export const FEATURED_PROJECTS = PROJECTS.filter((p) => p.featured);

export const PROJECT_CATEGORIES: { key: ProjectCategory; labelTr: string; labelEn: string }[] = [
  { key: "living", labelTr: "Salon", labelEn: "Living" },
  { key: "kitchen", labelTr: "Mutfak", labelEn: "Kitchen" },
  { key: "bedroom", labelTr: "Yatak Odası", labelEn: "Bedroom" },
  { key: "office", labelTr: "Ofis", labelEn: "Office" },
  { key: "architectural", labelTr: "Mimari", labelEn: "Architectural" },
  { key: "renovation", labelTr: "Yenileme", labelEn: "Renovation" },
];

export function getProjectBySlug(slug: string): Project | undefined {
  return PROJECTS.find((p) => p.slug === slug);
}

export function getNextProject(slug: string): Project {
  const idx = PROJECTS.findIndex((p) => p.slug === slug);
  return PROJECTS[(idx + 1) % PROJECTS.length];
}
