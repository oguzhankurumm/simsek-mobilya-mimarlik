import { Hammer, Compass, Home, ScrollText } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export interface Service {
  slug: string;
  icon: LucideIcon;
  titleTr: string;
  titleEn: string;
  summaryTr: string;
  summaryEn: string;
  bulletsTr: string[];
  bulletsEn: string[];
}

export const SERVICES: Service[] = [
  {
    slug: "ozel-tasarim-mobilya",
    icon: Hammer,
    titleTr: "Özel Tasarım Mobilya",
    titleEn: "Custom Furniture",
    summaryTr:
      "Konseptten teslime tüm mobilyalar atölyemizde, ustalarımızın elinde üretilir. Tek parça veya komple program.",
    summaryEn:
      "From concept to delivery, every piece is built in our atelier by master craftspeople. Single piece or full program.",
    bulletsTr: [
      "Salon ve oturma grubu",
      "Mutfak ve yemek odası",
      "Yatak odası, giyinme odası",
      "Kütüphane ve duvar üniteleri",
      "Çocuk ve genç odası",
      "Ofis ve toplantı mobilyası",
    ],
    bulletsEn: [
      "Salon & seating",
      "Kitchen & dining",
      "Bedroom & dressing room",
      "Library & wall units",
      "Children's & youth rooms",
      "Office & conference",
    ],
  },
  {
    slug: "mimari-proje",
    icon: Compass,
    titleTr: "Mimari Proje",
    titleEn: "Architectural Design",
    summaryTr:
      "Mimari ekibimiz, mevcut mekânı yeniden okur. Plan, ışık, akustik ve malzeme paleti tek bir gramerde toplanır.",
    summaryEn:
      "Our architectural team rereads the existing space. Plan, light, acoustics, and material palette converge into a single grammar.",
    bulletsTr: [
      "Mevcut durum analizi",
      "Plan, kesit, görünüş çizimleri",
      "Aydınlatma kurgusu",
      "Akustik tasarım",
      "3D modelleme ve render",
      "Şantiye yönetimi",
    ],
    bulletsEn: [
      "Existing-condition survey",
      "Plans, sections, elevations",
      "Lighting concept",
      "Acoustic design",
      "3D modelling & renders",
      "Site management",
    ],
  },
  {
    slug: "ev-yenileme",
    icon: Home,
    titleTr: "Ev Yenileme",
    titleEn: "Home Renovation",
    summaryTr:
      "Bir oda mı, bütün ev mi — proje yönetimini tek bir ekiple, tek bir bütçe çerçevesinde yürütüyoruz.",
    summaryEn:
      "A single room or a full home — one team, one budget framework, end-to-end project management.",
    bulletsTr: [
      "Tam kapsamlı yenileme",
      "Mutfak veya banyo yenileme",
      "Çatı, döşeme, sıva onarımı",
      "Elektrik, sıhhi tesisat",
      "Boya, parke, seramik",
      "Tek elden bütçe yönetimi",
    ],
    bulletsEn: [
      "Full renovation",
      "Kitchen or bath remodel",
      "Roof, floor, plaster repair",
      "Electrical & plumbing",
      "Paint, parquet, tile",
      "Single-budget management",
    ],
  },
  {
    slug: "danismanlik",
    icon: ScrollText,
    titleTr: "Tasarım Danışmanlığı",
    titleEn: "Design Consultancy",
    summaryTr:
      "Eviniz için somut bir dosya: malzeme paleti, mobilya seçimleri, dağılım önerisi ve uygulayıcı listesi.",
    summaryEn:
      "A concrete dossier for your home: material palette, furniture picks, layout proposal, and a vetted contractor list.",
    bulletsTr: [
      "Yerinde keşif ziyareti",
      "Malzeme & palet sunumu",
      "Mobilya satın alma rehberi",
      "Renk ve doku konsepti",
      "Uygulayıcı seçimi",
      "Yazılı dosya teslimi",
    ],
    bulletsEn: [
      "On-site survey",
      "Material & palette deck",
      "Furniture buy guide",
      "Colour & texture concept",
      "Contractor vetting",
      "Written dossier",
    ],
  },
];

export const PROCESS_STEPS = [
  {
    n: "01",
    titleTr: "Tanışma",
    titleEn: "Brief",
    bodyTr:
      "İhtiyacınızı, alışkanlıklarınızı, mekânın hikâyesini dinliyoruz. Yerinde keşif ücretsiz.",
    bodyEn:
      "We listen — your needs, habits, and the story of the space. The on-site survey is free.",
  },
  {
    n: "02",
    titleTr: "Konsept",
    titleEn: "Concept",
    bodyTr:
      "Mimari ekibimiz plan, palet ve atmosfer önerisini sunar. Birlikte revize ederiz.",
    bodyEn:
      "Our architectural team proposes plan, palette, and atmosphere. We refine it together.",
  },
  {
    n: "03",
    titleTr: "Atölye",
    titleEn: "Atelier",
    bodyTr:
      "Onaylanan tasarım, atölyemizde tek tek üretilir. İlerlemeyi haftalık görsellerle paylaşırız.",
    bodyEn:
      "The approved design is built piece by piece in our atelier. Weekly progress photos.",
  },
  {
    n: "04",
    titleTr: "Teslim",
    titleEn: "Delivery",
    bodyTr:
      "Yerinde kurulum ve son kontrol. Bir yıl tam garanti, sonra yıllık bakım.",
    bodyEn:
      "On-site install and final walk-through. One-year full warranty, then yearly maintenance.",
  },
];
