"use client";

import { tlToKurus, formatPrice } from "@/lib/money";
import { PrinterIcon } from "lucide-react";
import { CONTACT } from "@/config/site";

interface InvoiceProps {
  order: {
    orderNumber: string;
    createdAt: Date;
    status: string;
    totalAmountTl: string;
    items: {
      name: string;
      quantity: number;
      unitPriceTl: string;
      subtotalTl: string;
    }[];
    iban: {
      bankName: string;
      ibanNumber: string;
      accountHolder: string;
    } | null;
  };
  customer: {
    name: string;
    email: string;
    phone: string | null;
  };
  seller: {
    legalName: string;
    address: string;
    vkn: string;
    mersisNo: string;
    etbisNo: string;
  };
}

const STATUS_LABEL: Record<string, string> = {
  PENDING: "Ödeme Bekleniyor",
  PAYMENT_RECEIVED: "Ödeme Alındı",
  PROCESSING: "Hazırlanıyor",
  SHIPPED: "Kargoda",
  DELIVERED: "Teslim Edildi",
  CANCELLED: "İptal",
};

// Print-optimised invoice. `@media print` styles hide the surrounding chrome
// (bottom tabs, header, footer, cart drawer) so when the user hits "Print"
// they get a clean A4 page. Customer or admin opens this URL, prints to PDF.
// Date is rendered server-deterministically (no useEffect for hydration).

export function Invoice({ order, customer, seller }: InvoiceProps) {
  const totalKurus = tlToKurus(order.totalAmountTl);

  return (
    <article className="invoice-root container mx-auto max-w-3xl px-4 py-6 text-sm">
      <style jsx global>{`
        @media print {
          /* Hide every chrome surface */
          body > div > nav,
          body > div > header,
          body > div > footer,
          [data-pdp-add-to-cart-anchor],
          [aria-label="Mobil navigasyon"],
          [aria-label="Sepet"],
          [aria-label="Menü"],
          [aria-label="Çerez bildirimi"],
          [aria-label="Cookie notice"],
          [aria-label="Çerez Tercihleri"],
          [aria-label="Cookie Preferences"],
          .invoice-no-print {
            display: none !important;
          }
          body {
            background: white !important;
          }
          .invoice-root {
            padding: 0 !important;
            max-width: none !important;
          }
        }
      `}</style>

      <div className="invoice-no-print mb-4 flex items-center justify-end gap-2">
        <button
          type="button"
          onClick={() => window.print()}
          className="inline-flex items-center gap-1.5 rounded-full bg-ink px-4 py-2 text-xs font-semibold text-background hover:bg-ink/85"
        >
          <PrinterIcon className="h-3.5 w-3.5" /> Yazdır / PDF kaydet
        </button>
      </div>

      <header className="mb-6 flex flex-wrap items-start justify-between gap-4 border-b border-border pb-5">
        <div>
          <p className="text-[10px] font-mono uppercase tracking-widest text-ink-faint">
            Sipariş Faturası
          </p>
          <h1 className="mt-1 text-2xl font-semibold tabular-nums">
            {order.orderNumber}
          </h1>
          <p className="mt-1 text-xs text-ink-muted">
            {order.createdAt.toLocaleString("tr-TR", {
              dateStyle: "long",
              timeStyle: "short",
            })}{" "}
            · Durum: {STATUS_LABEL[order.status] ?? order.status}
          </p>
        </div>

        <div className="text-right text-xs">
          <p className="font-semibold uppercase tracking-widest text-ink-faint">
            Satıcı
          </p>
          <p className="mt-1 font-medium">{seller.legalName}</p>
          <p className="text-ink-muted">{seller.address}</p>
          {seller.vkn ? <p className="text-ink-muted">VKN {seller.vkn}</p> : null}
          {seller.mersisNo ? (
            <p className="text-ink-muted">MERSIS {seller.mersisNo}</p>
          ) : null}
          {seller.etbisNo ? (
            <p className="text-ink-muted">ETBİS {seller.etbisNo}</p>
          ) : null}
          <p className="text-ink-muted">{CONTACT.phoneDisplay}</p>
          <p className="text-ink-muted">{CONTACT.email}</p>
        </div>
      </header>

      <section className="mb-6 rounded-md border border-border p-4">
        <p className="text-[10px] uppercase tracking-widest text-ink-faint">
          Alıcı
        </p>
        <p className="mt-1 font-medium">{customer.name}</p>
        <p className="text-xs text-ink-muted">{customer.email}</p>
        {customer.phone ? (
          <p className="text-xs text-ink-muted">{customer.phone}</p>
        ) : null}
      </section>

      <table className="mb-6 w-full border-collapse text-sm">
        <thead>
          <tr className="border-b border-border text-left text-[10px] uppercase tracking-widest text-ink-faint">
            <th className="py-2">Ürün</th>
            <th className="py-2 text-right">Adet</th>
            <th className="py-2 text-right">Birim</th>
            <th className="py-2 text-right">Tutar</th>
          </tr>
        </thead>
        <tbody>
          {order.items.map((item, i) => (
            <tr key={i} className="border-b border-border/60 align-top">
              <td className="py-2">{item.name}</td>
              <td className="py-2 text-right tabular-nums">{item.quantity}</td>
              <td className="py-2 text-right tabular-nums">
                {formatPrice(tlToKurus(item.unitPriceTl))}
              </td>
              <td className="py-2 text-right font-semibold tabular-nums">
                {formatPrice(tlToKurus(item.subtotalTl))}
              </td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr>
            <td colSpan={3} className="pt-3 text-right text-xs text-ink-muted">
              KDV dahil toplam
            </td>
            <td className="pt-3 text-right text-lg font-semibold tabular-nums">
              {formatPrice(totalKurus)}
            </td>
          </tr>
        </tfoot>
      </table>

      {order.iban ? (
        <section className="mb-6 rounded-md border border-border bg-surface-2/40 p-4 text-xs">
          <p className="font-semibold uppercase tracking-widest text-ink-faint">
            Ödeme Bilgisi
          </p>
          <p className="mt-1">{order.iban.bankName}</p>
          <p className="font-mono tabular-nums">{order.iban.ibanNumber}</p>
          <p className="text-ink-muted">{order.iban.accountHolder}</p>
          <p className="mt-2 text-[11px] text-ink-muted">
            Açıklamaya sipariş numarası ({order.orderNumber}) yazıldığında ödeme
            otomatik eşleşir.
          </p>
        </section>
      ) : null}

      <footer className="border-t border-border pt-4 text-[11px] text-ink-faint">
        Bu belge Mesafeli Sözleşmeler Yönetmeliği kapsamında elektronik
        kayıttır. Geri ödeme + iade prosedürü için cayma hakkı sayfasına
        bakınız. Tüketici Hakem Heyetleri / Tüketici Mahkemeleri yetkilidir.
      </footer>
    </article>
  );
}
