import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Invoice } from "@/components/commerce/invoice";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ orderNumber: string }>;
}

// Admin's view of the invoice. Same Invoice component, but no auth-gate
// on "this is your order" — admin layout already requires admin role.

export default async function AdminInvoicePage({ params }: PageProps) {
  const { orderNumber } = await params;

  const order = await prisma.order.findUnique({
    where: { orderNumber },
    include: { items: true, iban: true, user: true },
  });
  if (!order) notFound();

  const settings = await prisma.siteSettings.findUnique({
    where: { id: "singleton" },
  });

  return (
    <Invoice
      order={{
        orderNumber: order.orderNumber,
        createdAt: order.createdAt,
        status: order.status,
        totalAmountTl: order.totalAmount.toString(),
        items: order.items.map((i) => ({
          name: i.productName,
          quantity: i.quantity,
          unitPriceTl: i.salePrice.toString(),
          subtotalTl: i.subtotal.toString(),
        })),
        iban: order.iban
          ? {
              bankName: order.iban.bankName,
              ibanNumber: order.iban.ibanNumber,
              accountHolder: order.iban.accountHolder,
            }
          : null,
      }}
      customer={{
        name: order.user?.name ?? order.guestName ?? "(Konuk)",
        email: order.user?.email ?? order.guestEmail ?? "—",
        phone: order.user?.phone ?? order.guestPhone ?? null,
      }}
      seller={{
        legalName: settings?.siteName ?? "Şimşek Mobilya & Mimarlık",
        address: settings?.legalAddress ?? "İstanbul, Türkiye",
        vkn: settings?.vkn ?? "",
        mersisNo: settings?.mersisNo ?? "",
        etbisNo: settings?.etbisNo ?? "",
      }}
    />
  );
}
