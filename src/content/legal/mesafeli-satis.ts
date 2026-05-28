/**
 * Mesafeli Satış Sözleşmesi — TR (mevzuat dili).
 * PLACEHOLDER. Phase 0 T10: avukat/SMMM onaylı template ile değiştirilecek.
 * Şu hali ile ne sipariş kabul edilir ne de yayına alınır.
 */

export const MESAFELI_SATIS = {
  title: "Mesafeli Satış Sözleşmesi",
  effectiveDate: "TBD — yayın öncesi avukat onayı",
  sellerInfo: {
    legalName: "Şimşek Mobilya & Mimarlık",
    address: "İstanbul, Türkiye",
    mersisNo: "TBD",
    vkn: "TBD",
    etbisNo: "TBD",
    email: "info@simsekmobilya.com",
    phone: "+90 532 646 39 19",
  },
  sections: [
    {
      heading: "1. Taraflar",
      body: "İşbu sözleşme, SATICI olarak Şimşek Mobilya & Mimarlık ile ALICI arasında, alıcının simsekmobilya.com web sitesinden gerçekleştirdiği sipariş kapsamında düzenlenmiştir.",
    },
    {
      heading: "2. Sözleşmenin Konusu",
      body: "Bu sözleşme, alıcının elektronik ortamda sipariş verdiği aşağıda nitelikleri ve satış fiyatı belirtilen ürünün satışı ve teslimine ilişkin olarak Mesafeli Sözleşmeler Yönetmeliği hükümleri kapsamında tarafların hak ve yükümlülüklerini düzenler.",
    },
    {
      heading: "3. Fiyat ve Ödeme",
      body: "Ürün satış fiyatları KDV dahil olarak gösterilir. Ödeme banka havalesi/EFT ile satıcının belirttiği IBAN'a yapılır. Ödeme tamamlanmadan ürün sevkiyatı yapılmaz.",
    },
    {
      heading: "4. Teslimat",
      body: "Ürünler, ödemenin satıcı hesabına geçmesinden itibaren 5-15 iş günü içinde alıcının belirttiği adrese teslim edilir. Kargo ücreti ve teslimat süreleri ön bilgilendirme formunda detaylandırılmıştır.",
    },
    {
      heading: "5. Cayma Hakkı",
      body: "Alıcı, teslim aldığı tarihten itibaren 14 gün içinde herhangi bir gerekçe göstermeden cayma hakkını kullanabilir. Cayma süresi ve istisnaları için Cayma Hakkı Formuna bakınız.",
    },
    {
      heading: "6. Uyuşmazlık Çözümü",
      body: "Sözleşmeden doğan uyuşmazlıkların çözümünde Türkiye Cumhuriyeti Tüketici Hakem Heyetleri ve Tüketici Mahkemeleri yetkilidir.",
    },
  ],
} as const;
