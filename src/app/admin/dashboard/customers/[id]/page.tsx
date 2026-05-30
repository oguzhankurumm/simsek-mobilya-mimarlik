import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ChevronLeft,
  Mail,
  Phone,
  MessageCircle,
  ShoppingBag,
  Heart,
  MapPin,
} from "lucide-react";
import { prisma } from "@/lib/prisma";
import { tlToKurus, formatPrice } from "@/lib/money";
import { buildWhatsappUrl } from "@/lib/whatsapp";

export const dynamic = "force-dynamic";

const STATUS_LABEL: Record<string, string> = {
  PENDING: "Bekliyor",
  PAYMENT_RECEIVED: "Ödendi",
  PROCESSING: "Hazırlanıyor",
  SHIPPED: "Kargoda",
  DELIVERED: "Teslim",
  CANCELLED: "İptal",
};

const STATUS_COLOR: Record<string, string> = {
  PENDING: "bg-amber-100 text-amber-900",
  PAYMENT_RECEIVED: "bg-blue-100 text-blue-900",
  PROCESSING: "bg-violet-100 text-violet-900",
  SHIPPED: "bg-cyan-100 text-cyan-900",
  DELIVERED: "bg-emerald-100 text-emerald-900",
  CANCELLED: "bg-zinc-100 text-zinc-900",
};

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function CustomerDetailPage({ params }: PageProps) {
  const { id } = await params;

  const customer = await prisma.user.findUnique({
    where: { id },
    include: {
      orders: {
        orderBy: { createdAt: "desc" },
        include: { items: { select: { quantity: true } } },
        take: 50,
      },
      addresses: {
        orderBy: [{ isDefault: "desc" }, { id: "asc" }],
      },
      wishlist: {
        include: {
          product: {
            select: {
              id: true,
              name: true,
              slug: true,
              stock: true,
              active: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!customer || customer.role !== "CUSTOMER") notFound();

  const totalSpentKurus = customer.orders
    .filter((o) => o.status !== "CANCELLED")
    .reduce((sum, o) => sum + tlToKurus(o.totalAmount.toString()), 0);

  const waUrl = customer.phone
    ? buildWhatsappUrl(
        customer.phone,
        `Merhaba ${customer.name}, Şimşek Mobilya'dan ulaşıyorum.`,
      )
    : null;

  return (
    <div className="space-y-6">
      <Link
        href="/admin/dashboard/customers"
        className="inline-flex items-center gap-1 text-xs text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200"
      >
        <ChevronLeft className="h-3.5 w-3.5" /> Tüm Müşteriler
      </Link>

      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-[10px] font-mono uppercase tracking-widest text-zinc-500">
            Müşteri
          </p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight">
            {customer.name}
          </h1>
          <p className="mt-1 flex flex-wrap items-center gap-3 text-xs text-zinc-500">
            <span className="inline-flex items-center gap-1">
              <Mail className="h-3 w-3" />
              {customer.email}
            </span>
            {customer.phone ? (
              <span className="inline-flex items-center gap-1">
                <Phone className="h-3 w-3" />
                {customer.phone}
              </span>
            ) : null}
            <span>
              Üyelik:{" "}
              {customer.createdAt.toLocaleDateString("tr-TR", {
                dateStyle: "medium",
              })}
            </span>
          </p>
        </div>
        <div className="flex gap-2">
          <a
            href={`mailto:${customer.email}`}
            className="inline-flex items-center gap-1.5 rounded-full border border-zinc-300 px-4 py-2 text-xs font-medium hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-800"
          >
            <Mail className="h-3.5 w-3.5" /> E-posta
          </a>
          {waUrl ? (
            <a
              href={waUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-full bg-[#25D366] px-4 py-2 text-xs font-semibold text-white hover:bg-[#1ebe5d]"
            >
              <MessageCircle className="h-3.5 w-3.5" /> WhatsApp
            </a>
          ) : null}
        </div>
      </header>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <Metric
          icon={ShoppingBag}
          label="Toplam Sipariş"
          value={String(customer.orders.length)}
        />
        <Metric
          icon={ShoppingBag}
          label="Toplam Harcama"
          value={formatPrice(totalSpentKurus)}
        />
        <Metric
          icon={Heart}
          label="Favori"
          value={String(customer.wishlist.length)}
        />
        <Metric
          icon={MapPin}
          label="Adres"
          value={String(customer.addresses.length)}
        />
      </div>

      <section className="rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
        <header className="border-b border-zinc-200 px-5 py-3 text-sm font-semibold dark:border-zinc-800">
          Sipariş Geçmişi ({customer.orders.length})
        </header>
        {customer.orders.length === 0 ? (
          <p className="p-5 text-sm text-zinc-500">Henüz sipariş yok.</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="border-b border-zinc-200 text-left text-[10px] uppercase tracking-widest text-zinc-500 dark:border-zinc-800">
              <tr>
                <th className="px-4 py-2.5">Sipariş No</th>
                <th className="px-4 py-2.5">Adet</th>
                <th className="px-4 py-2.5">Tutar</th>
                <th className="px-4 py-2.5">Durum</th>
                <th className="px-4 py-2.5">Tarih</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
              {customer.orders.map((order) => {
                const itemCount = order.items.reduce(
                  (s, i) => s + i.quantity,
                  0,
                );
                return (
                  <tr
                    key={order.orderNumber}
                    className="hover:bg-zinc-50 dark:hover:bg-zinc-800"
                  >
                    <td className="px-4 py-3">
                      <Link
                        href={`/admin/dashboard/orders/${order.orderNumber}`}
                        className="font-medium tabular-nums hover:underline"
                      >
                        {order.orderNumber}
                      </Link>
                    </td>
                    <td className="px-4 py-3 tabular-nums">{itemCount}</td>
                    <td className="px-4 py-3 font-semibold tabular-nums">
                      {formatPrice(tlToKurus(order.totalAmount.toString()))}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-block rounded-full px-2 py-0.5 text-[10px] ${STATUS_COLOR[order.status] ?? "bg-zinc-100"}`}
                      >
                        {STATUS_LABEL[order.status] ?? order.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-zinc-500 tabular-nums">
                      {order.createdAt.toLocaleDateString("tr-TR")}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </section>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <section className="rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
          <header className="border-b border-zinc-200 px-5 py-3 text-sm font-semibold dark:border-zinc-800">
            Adresler ({customer.addresses.length})
          </header>
          {customer.addresses.length === 0 ? (
            <p className="p-5 text-sm text-zinc-500">Kayıtlı adres yok.</p>
          ) : (
            <ul className="divide-y divide-zinc-200 text-sm dark:divide-zinc-800">
              {customer.addresses.map((addr) => (
                <li key={addr.id} className="px-5 py-3">
                  <div className="flex items-baseline gap-2">
                    <p className="font-medium">{addr.title}</p>
                    {addr.isDefault ? (
                      <span className="rounded-full bg-brand/10 px-1.5 py-0.5 text-[9px] font-medium text-brand">
                        Varsayılan
                      </span>
                    ) : null}
                  </div>
                  <p className="text-xs text-zinc-500">
                    {addr.fullName} · {addr.phone}
                  </p>
                  <p className="text-xs">
                    {addr.addressLine}, {addr.district}/{addr.city}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
          <header className="border-b border-zinc-200 px-5 py-3 text-sm font-semibold dark:border-zinc-800">
            Favoriler ({customer.wishlist.length})
          </header>
          {customer.wishlist.length === 0 ? (
            <p className="p-5 text-sm text-zinc-500">Favori ürün yok.</p>
          ) : (
            <ul className="divide-y divide-zinc-200 text-sm dark:divide-zinc-800">
              {customer.wishlist.slice(0, 12).map((row) => (
                <li
                  key={row.id}
                  className="flex items-center justify-between gap-2 px-5 py-2"
                >
                  <Link
                    href={`/admin/dashboard/products/${row.product.id}`}
                    className="hover:underline"
                  >
                    {row.product.name}
                  </Link>
                  <span className="text-xs text-zinc-500">
                    stok {row.product.stock}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}

function Metric({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
      <Icon className="h-5 w-5 text-zinc-500" />
      <p className="mt-3 text-xs uppercase tracking-wide text-zinc-500">
        {label}
      </p>
      <p className="mt-1 text-xl font-semibold tabular-nums">{value}</p>
    </div>
  );
}
