import { CsvImportClient } from "./csv-import-client";

export const dynamic = "force-dynamic";

const EXAMPLE_CSV = `name,slug,category,originalPrice,salePrice,stock,description,featured,active,imageUrl,widthCm,depthCm,heightCm,material,color,room
Yağlı Meşe Yemek Masası,yagli-mese-yemek-masasi,yemek-odasi,"6500,00","5750,00",2,"8 kişilik el yapımı meşe masa",true,true,https://example.com/photo.jpg,240,100,76,"meşe,çelik","doğal",yemek-odasi
Bouclé 3+2+1 Koltuk,boucle-koltuk-takimi,salon,"8900,00","7500,00",1,"Krem bouclé kumaş koltuk takımı",true,true,https://example.com/photo2.jpg,320,95,85,"bouclé,ahşap",krem,salon`;

export default function ImportProductsPage() {
  return (
    <div className="space-y-6">
      <header>
        <p className="text-[10px] font-mono uppercase tracking-widest text-zinc-500">
          Toplu İçe Aktarma
        </p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight">
          CSV ile Ürün Ekle
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-zinc-500">
          Mevcut slug ile eşleşen kayıtlar güncellenir, yenileri eklenir.
          En fazla 500 satır / 2MB. Fiyatlar TL cinsinden, virgül ya da
          nokta ile ondalık kabul edilir.
        </p>
      </header>

      <section className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
        <h2 className="text-sm font-semibold">Beklenen Sütunlar</h2>
        <ul className="mt-2 grid grid-cols-1 gap-1 text-xs text-zinc-600 dark:text-zinc-400 md:grid-cols-2">
          <li>
            <code>name</code> — Ürün adı (zorunlu)
          </li>
          <li>
            <code>slug</code> — opsiyonel, boşsa otomatik üretilir
          </li>
          <li>
            <code>category</code> — kategori slug&apos;ı (zorunlu, mevcut olmalı)
          </li>
          <li>
            <code>originalPrice</code> — orijinal fiyat TL (zorunlu)
          </li>
          <li>
            <code>salePrice</code> — satış fiyatı, boşsa orijinale eşit
          </li>
          <li>
            <code>stock</code> — adet (varsayılan 0)
          </li>
          <li>
            <code>description</code> — açıklama
          </li>
          <li>
            <code>featured</code> — true/1/evet → öne çıkan
          </li>
          <li>
            <code>active</code> — true/1/evet → sitede gösterilir (varsayılan true)
          </li>
          <li>
            <code>imageUrl</code> — ana görsel URL&apos;si
          </li>
          <li>
            <code>widthCm</code>, <code>depthCm</code>, <code>heightCm</code> — boyutlar
          </li>
          <li>
            <code>material</code>, <code>color</code> — virgülle çoklu
          </li>
          <li>
            <code>room</code> — salon, yatak-odasi, yemek-odasi…
          </li>
        </ul>

        <details className="mt-4">
          <summary className="cursor-pointer text-xs text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-300">
            Örnek CSV&apos;yi göster
          </summary>
          <pre className="mt-2 overflow-x-auto rounded bg-zinc-50 p-3 text-[10px] text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
{EXAMPLE_CSV}
          </pre>
        </details>
      </section>

      <CsvImportClient />
    </div>
  );
}
