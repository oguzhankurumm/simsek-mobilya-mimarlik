// Prefilled WhatsApp click-to-chat. wa.me opens native WhatsApp on mobile,
// web.whatsapp.com on desktop. Desktop without WhatsApp Web logged in shows a
// QR scan page — see /odeme step 3 for the fallback CTA.

export function normalizeE164(raw: string): string {
  const digits = raw.replace(/\D+/g, "");
  if (digits.startsWith("90")) return `+${digits}`;
  if (digits.startsWith("0")) return `+9${digits}`;
  if (!raw.startsWith("+")) return `+90${digits}`;
  return `+${digits}`;
}

export function buildWhatsappUrl(numberE164: string, message: string): string {
  const phone = numberE164.replace(/\D+/g, "");
  const text = encodeURIComponent(message);
  return `https://wa.me/${phone}?text=${text}`;
}

export type CartLineForMessage = {
  name: string;
  quantity: number;
  unitPriceTl: string; // already formatted
};

export function buildOrderReceiptMessage(opts: {
  orderNumber: string;
  totalTl: string;
  items: CartLineForMessage[];
}): string {
  const itemLines = opts.items
    .map(
      (i) => `• ${i.name} × ${i.quantity} = ${i.unitPriceTl}`,
    )
    .join("\n");
  return [
    "Merhaba, Şimşek Mobilya siparişim için dekont gönderiyorum.",
    `Sipariş No: ${opts.orderNumber}`,
    `Tutar: ${opts.totalTl}`,
    "Ürünler:",
    itemLines,
  ].join("\n");
}

export function buildProductInquiryMessage(opts: {
  productName: string;
  productSlug: string;
  baseUrl: string;
}): string {
  return [
    `Merhaba, ${opts.productName} hakkında bilgi almak istiyorum.`,
    `Ürün: ${opts.baseUrl}/urunler/${opts.productSlug}`,
  ].join("\n");
}
