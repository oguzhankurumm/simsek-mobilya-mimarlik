import { notFound, redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/get-user";
import { prisma } from "@/lib/prisma";
import { Invoice } from "@/components/commerce/invoice";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ orderNumber: string }>;
}

// Print-ready invoice ("fatura") page for the customer. Visiting this URL
// renders a clean invoice that's optimised for the browser's "Print → Save
// as PDF" flow. The customer can then archive it or email it.

export default async function CustomerInvoicePage({ params }: PageProps) {
  const user = await getCurrentUser();
  if (!user) redirect("/giris");

  const { orderNumber } = await params;
  const order = await prisma.order.findFirst({
    where: { orderNumber, userId: user.id },
    include: { items: true, iban: true },
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
        name: user.name,
        email: user.email,
        phone: user.phone,
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
