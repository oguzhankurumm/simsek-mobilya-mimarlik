/**
 * Müşteri yorumları — Şimşek Mobilya & Mimarlık'ın 28 yıllık ilişkilerinden
 * temsili sözler. Yayına almadan önce gerçek müşterilerden alınan
 * onaylanmış yorumlarla değiştirilmesi önerilir; yapı bozulmadan
 * sadece metinleri güncellemek yeterlidir.
 */

export interface Testimonial {
  /** Görünür anonim isim — gerçek müşteri ismi varsa o kullanılabilir. */
  nameTr: string;
  nameEn: string;
  /** İlçe / mahalle — kimlik açığa çıkmasın diye geniş bölge. */
  locationTr: string;
  locationEn: string;
  /** Hangi tür iş yapıldı — ev yenileme, mutfak, banyo, gardırop vb. */
  projectTypeTr: string;
  projectTypeEn: string;
  quoteTr: string;
  quoteEn: string;
  /** Müşterinin ilişkide olduğu yıl — aile süreklilikleri için. */
  yearWith?: number;
}

export const TESTIMONIALS: Testimonial[] = [
  {
    nameTr: "M. Yılmaz",
    nameEn: "M. Yılmaz",
    locationTr: "Kadıköy",
    locationEn: "Kadıköy",
    projectTypeTr: "Tam Ev Yenileme",
    projectTypeEn: "Full home renovation",
    quoteTr:
      "Üç ayda evi tanınmaz hale getirdiler. Ölçü hassasiyeti, malzemenin kalitesi ve en önemlisi söz verdikleri tarihte bitirdikleri için çok memnunum. Aile dostumuza tavsiye ettim, onlarda da aynı işi yaptılar.",
    quoteEn:
      "They transformed the home in three months. The precision, the materials and — most importantly — finishing on the date they promised. I recommended them to a family friend; they had the same experience.",
    yearWith: 2026,
  },
  {
    nameTr: "N. Demir",
    nameEn: "N. Demir",
    locationTr: "Ataşehir",
    locationEn: "Ataşehir",
    projectTypeTr: "Lake Mutfak Dolapları",
    projectTypeEn: "Lacquered kitchen cabinetry",
    quoteTr:
      "Mutfağımızı baştan kurguladılar. Ayrıntılarda hassaslar — derz boşlukları, dolap içi düzenleyiciler, koryan tezgah birleşimleri — hepsi ustaca. Bir yıl sonra hâlâ tek bir kapak rahatsız etmiyor.",
    quoteEn:
      "They redesigned our kitchen end-to-end. Obsessive about the small things — joints, internal organisers, the Corian counter seams — all impeccable. A year on, not a single door has shifted.",
    yearWith: 2024,
  },
  {
    nameTr: "S. Kaya",
    nameEn: "S. Kaya",
    locationTr: "Çatalca",
    locationEn: "Çatalca",
    projectTypeTr: "Yatak Odası Gardıropları",
    projectTypeEn: "Bedroom wardrobes",
    quoteTr:
      "İki yatak odamıza özel ölçü gardırop yaptılar. Tavana kadar, derzi belli olmayacak şekilde. Pirinç tutamak detaylarını kendileri önerdi, çok iyi oldu.",
    quoteEn:
      "Made bespoke wardrobes for two bedrooms — full height, seamless. They suggested the brass pull detail themselves, and it was the right call.",
    yearWith: 2025,
  },
  {
    nameTr: "A. Öztürk",
    nameEn: "A. Öztürk",
    locationTr: "Şişli",
    locationEn: "Şişli",
    projectTypeTr: "Ev Yenileme",
    projectTypeEn: "Home renovation",
    quoteTr:
      "Babam zamanında da Şimşek'le çalışmıştık, şimdi ben kendi evim için aradım. Aynı iş ahlâkı, aynı düzgünlük. İkinci nesil müşteri olmaktan mutluyum.",
    quoteEn:
      "My father worked with Şimşek decades ago. I called them for my own home. Same work ethic, same care. Proud to be a second-generation client.",
    yearWith: 2022,
  },
  {
    nameTr: "E. Aksoy",
    nameEn: "E. Aksoy",
    locationTr: "Avrupa Konutları TEM",
    locationEn: "Avrupa Konutları TEM",
    projectTypeTr: "Banyo Dolapları",
    projectTypeEn: "Bathroom vanities",
    quoteTr:
      "Sitemizdeki üç komşuyla birlikte banyolarımızı yeniledik. Her birinin damak tadı farklıydı, üçüne de ayrı ayrı çözüm sundular. Yorum kısmında okuduğumdan değil, gözümüzle gördüğümüzden tavsiye ediyorum.",
    quoteEn:
      "Three of us neighbours redid our bathrooms together. Each had different taste, and they tailored each one. I recommend them not from a review I read, but from what I saw with my own eyes.",
    yearWith: 2025,
  },
];
