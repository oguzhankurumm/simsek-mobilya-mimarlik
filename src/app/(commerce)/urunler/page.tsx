import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Ürünler — Şimşek Mobilya",
  description:
    "Atölyemizden seçilmiş özel tasarım mobilya koleksiyonu. KDV dahil fiyatlarla.",
};

export default function ProductsPage() {
  return (
    <section className="container mx-auto px-4 py-12">
      <h1 className="text-3xl font-semibold tracking-tight">Ürünler</h1>
      <p className="mt-3 text-muted-foreground">
        Phase B&apos;de inşa ediliyor — ürün listesi, kategori filtreleme,
        mobile grid burada yer alacak.
      </p>
    </section>
  );
}
