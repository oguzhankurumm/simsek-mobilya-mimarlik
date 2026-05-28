import "server-only";
import { CONTACT, SITE } from "@/config/site";

// Thin Resend wrapper — same opt-in pattern as src/server/contact-action.ts.
// If RESEND_API_KEY is unset (dev / pre-launch), the email is logged to the
// server console and the call resolves OK. Production must set the key.

interface SendEmailInput {
  to: string;
  subject: string;
  text: string;
  html?: string;
  replyTo?: string;
}

export async function sendEmail(input: SendEmailInput): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY;
  const sender =
    process.env.CONTACT_EMAIL_FROM ??
    process.env.RESEND_FROM ??
    `noreply@${SITE.domain}`;

  if (!apiKey) {
    if (process.env.NODE_ENV !== "production") {
      console.log("[email:dev]", {
        from: sender,
        to: input.to,
        subject: input.subject,
        text: input.text,
      });
      return true;
    }
    console.warn(
      "[email] RESEND_API_KEY not set in production — email skipped",
    );
    return false;
  }

  try {
    const { Resend } = await import("resend");
    const resend = new Resend(apiKey);
    await resend.emails.send({
      from: sender,
      to: [input.to],
      replyTo: input.replyTo ?? CONTACT.email,
      subject: input.subject,
      text: input.text,
      html: input.html,
    });
    return true;
  } catch (err) {
    console.error("[email] send failed", err);
    return false;
  }
}

export function buildOrderConfirmationEmail(opts: {
  recipientName: string;
  orderNumber: string;
  totalTl: string;
  ibanBankName: string;
  ibanNumber: string;
  ibanHolder: string;
  whatsappLink: string;
  items: { name: string; quantity: number; subtotalTl: string }[];
}) {
  const subject = `${SITE.shortName} — Sipariş Onayı ${opts.orderNumber}`;
  const itemLinesTxt = opts.items
    .map((i) => `  • ${i.name} × ${i.quantity} — ${i.subtotalTl}`)
    .join("\n");

  const text = [
    `Merhaba ${opts.recipientName},`,
    ``,
    `Siparişiniz alındı. Aşağıdaki detayları kullanarak ödemenizi`,
    `gerçekleştirebilirsiniz. Ödeme açıklamasına sipariş numaranızı yazınız.`,
    ``,
    `Sipariş No: ${opts.orderNumber}`,
    `Toplam Tutar: ${opts.totalTl}`,
    ``,
    `Ürünler:`,
    itemLinesTxt,
    ``,
    `IBAN:`,
    `  ${opts.ibanBankName}`,
    `  ${opts.ibanNumber}`,
    `  Hesap Sahibi: ${opts.ibanHolder}`,
    ``,
    `Dekontunuzu WhatsApp üzerinden iletirseniz onay süresi 1 günden`,
    `birkaç saate iner: ${opts.whatsappLink}`,
    ``,
    `Sorularınız için info@simsekmobilya.com veya +90 532 646 39 19.`,
    ``,
    `— ${SITE.name}`,
  ].join("\n");

  const itemLinesHtml = opts.items
    .map(
      (i) =>
        `<tr><td style="padding:6px 0; font-size:13px;">${escapeHtml(i.name)} × ${i.quantity}</td><td style="padding:6px 0; font-size:13px; text-align:right; font-variant-numeric:tabular-nums; font-weight:600;">${escapeHtml(i.subtotalTl)}</td></tr>`,
    )
    .join("");

  const html = `
    <div style="font-family: ui-sans-serif, system-ui, sans-serif; max-width: 560px; margin: 0 auto; padding: 24px; color:#1a1a1a;">
      <p style="font-size:14px;">Merhaba ${escapeHtml(opts.recipientName)},</p>
      <p style="font-size:14px;">Siparişiniz alındı. Aşağıdaki detayları kullanarak ödemenizi gerçekleştirebilirsiniz.</p>
      <div style="background:#FAFAF7; border:1px solid #E5E0D5; border-radius:12px; padding:16px; margin:20px 0; text-align:center;">
        <p style="font-size:10px; letter-spacing:2px; text-transform:uppercase; color:#888; margin:0;">Sipariş Numaranız</p>
        <p style="font-size:24px; font-weight:700; letter-spacing:2px; color:#ED1C24; margin:6px 0 0; font-variant-numeric:tabular-nums;">${escapeHtml(opts.orderNumber)}</p>
      </div>
      <table style="width:100%; border-collapse:collapse; margin:16px 0;">
        ${itemLinesHtml}
        <tr style="border-top:1px solid #E5E0D5;">
          <td style="padding:10px 0 0; font-size:14px; font-weight:600;">Toplam</td>
          <td style="padding:10px 0 0; font-size:14px; font-weight:700; text-align:right; font-variant-numeric:tabular-nums;">${escapeHtml(opts.totalTl)}</td>
        </tr>
      </table>
      <div style="border:1px solid #E5E0D5; border-radius:8px; padding:14px; margin:20px 0; font-size:13px;">
        <p style="margin:0 0 6px; font-weight:600;">IBAN</p>
        <p style="margin:0 0 2px;">${escapeHtml(opts.ibanBankName)}</p>
        <p style="margin:0; font-family: ui-monospace, monospace; color:#444;">${escapeHtml(opts.ibanNumber)}</p>
        <p style="margin:2px 0 0; color:#666;">${escapeHtml(opts.ibanHolder)}</p>
        <p style="margin:10px 0 0; font-size:11px; color:#a18900;">⚠ Açıklamaya sipariş numaranızı yazmayı unutmayın.</p>
      </div>
      ${opts.whatsappLink ? `<p style="text-align:center; margin:20px 0;"><a href="${opts.whatsappLink}" style="display:inline-block; background:#25D366; color:#fff; padding:12px 24px; border-radius:24px; text-decoration:none; font-weight:600; font-size:14px;">Dekontu WhatsApp'tan Gönder</a></p>` : ""}
      <p style="font-size:12px; color:#777; margin-top:24px;">Sorularınız için info@simsekmobilya.com</p>
      <p style="font-size:12px; color:#999; margin-top:8px;">— ${escapeHtml(SITE.name)}</p>
    </div>
  `;

  return { subject, text, html };
}

const STATUS_TR: Record<string, string> = {
  PENDING: "Ödeme Bekleniyor",
  PAYMENT_RECEIVED: "Ödeme Alındı",
  PROCESSING: "Hazırlanıyor",
  SHIPPED: "Kargoda",
  DELIVERED: "Teslim Edildi",
  CANCELLED: "İptal",
};

const STATUS_BODY: Record<string, string> = {
  PAYMENT_RECEIVED:
    "Ödemeniz onaylandı. Siparişiniz hazırlanmaya alındı.",
  PROCESSING:
    "Siparişiniz atölyemizde hazırlanıyor. Kargo aşamasına geçince tekrar bilgilendireceğiz.",
  SHIPPED:
    "Siparişiniz kargoya teslim edildi. Yakında elinizde.",
  DELIVERED:
    "Siparişiniz teslim edildi. Ürünleri beğeneceğinizi umuyoruz — herhangi bir sorun olursa info@simsekmobilya.com",
  CANCELLED:
    "Siparişiniz iptal edildi. Yapmış olduğunuz ödeme varsa iade prosedürü için bizimle iletişime geçin.",
  PENDING: "Siparişiniz alındı, ödemenizi bekliyoruz.",
};

export function buildOrderStatusEmail(opts: {
  recipientName: string;
  orderNumber: string;
  status: string;
  trackingUrl: string;
}) {
  const statusLabel = STATUS_TR[opts.status] ?? opts.status;
  const body = STATUS_BODY[opts.status] ?? "Sipariş durumunuz güncellendi.";
  const subject = `${SITE.shortName} — Sipariş ${opts.orderNumber} • ${statusLabel}`;

  const text = [
    `Merhaba ${opts.recipientName},`,
    ``,
    `Siparişinizin yeni durumu: ${statusLabel}`,
    ``,
    body,
    ``,
    `Sipariş No: ${opts.orderNumber}`,
    `Detay: ${opts.trackingUrl}`,
    ``,
    `— ${SITE.name}`,
  ].join("\n");

  const html = `
    <div style="font-family: ui-sans-serif, system-ui, sans-serif; max-width: 560px; margin: 0 auto; padding: 24px; color:#1a1a1a;">
      <p style="font-size:14px;">Merhaba ${escapeHtml(opts.recipientName)},</p>
      <div style="background:#FAFAF7; border:1px solid #E5E0D5; border-radius:12px; padding:16px; margin:18px 0; text-align:center;">
        <p style="font-size:10px; letter-spacing:2px; text-transform:uppercase; color:#888; margin:0 0 4px;">Yeni Durum</p>
        <p style="font-size:18px; font-weight:700; color:#1a1a1a; margin:0;">${escapeHtml(statusLabel)}</p>
        <p style="font-size:12px; color:#666; margin:6px 0 0; font-variant-numeric:tabular-nums;">Sipariş No: ${escapeHtml(opts.orderNumber)}</p>
      </div>
      <p style="font-size:14px;">${escapeHtml(body)}</p>
      <p style="text-align:center; margin:20px 0;">
        <a href="${opts.trackingUrl}" style="display:inline-block; background:#ED1C24; color:#fff; padding:10px 20px; border-radius:24px; text-decoration:none; font-weight:600; font-size:13px;">Sipariş Detayı</a>
      </p>
      <p style="font-size:12px; color:#999; margin-top:24px;">— ${escapeHtml(SITE.name)}</p>
    </div>
  `;

  return { subject, text, html };
}

export function buildStockBackInEmail(opts: {
  recipientName: string;
  productName: string;
  productUrl: string;
}) {
  const subject = `${SITE.shortName} — ${opts.productName} tekrar stokta`;
  const text = [
    `Merhaba ${opts.recipientName},`,
    ``,
    `Bildirim aldığınız ürün tekrar stokta:`,
    `${opts.productName}`,
    ``,
    `Hemen göz at: ${opts.productUrl}`,
    ``,
    `Stok sınırlı olabilir — ilgileniyorsanız beklemeden bakmanızı öneririz.`,
    ``,
    `— ${SITE.name}`,
  ].join("\n");

  const html = `
    <div style="font-family: ui-sans-serif, system-ui, sans-serif; max-width: 520px; margin: 0 auto; padding: 24px; color:#1a1a1a;">
      <p style="font-size:14px;">Merhaba ${escapeHtml(opts.recipientName)},</p>
      <p style="font-size:14px;">Bildirim aldığınız ürün tekrar stokta:</p>
      <p style="font-size:20px; font-weight:600; margin:12px 0;">${escapeHtml(opts.productName)}</p>
      <p style="text-align:center; margin:20px 0;">
        <a href="${opts.productUrl}" style="display:inline-block; background:#ED1C24; color:#fff; padding:12px 24px; border-radius:24px; text-decoration:none; font-weight:600; font-size:14px;">Ürüne Git</a>
      </p>
      <p style="font-size:12px; color:#999; margin-top:24px;">— ${escapeHtml(SITE.name)}</p>
    </div>
  `;

  return { subject, text, html };
}

export function buildPasswordResetEmail(opts: {
  recipientName: string;
  code: string;
}) {
  const subject = `${SITE.shortName} — Şifre Sıfırlama Kodu`;
  const text = [
    `Merhaba ${opts.recipientName},`,
    ``,
    `${SITE.shortName} hesabınız için şifre sıfırlama kodu:`,
    ``,
    `   ${opts.code}`,
    ``,
    `Bu kod 15 dakika içinde geçerlidir. Talebi siz yapmadıysanız bu`,
    `e-postayı yok sayabilirsiniz; hesabınız güvende.`,
    ``,
    `— ${SITE.name}`,
  ].join("\n");

  const html = `
    <div style="font-family: ui-sans-serif, system-ui, sans-serif; max-width: 480px; margin: 0 auto; padding: 24px;">
      <p style="font-size: 14px; color: #444;">Merhaba ${escapeHtml(opts.recipientName)},</p>
      <p style="font-size: 14px; color: #444;">${escapeHtml(SITE.shortName)} hesabınız için şifre sıfırlama kodu:</p>
      <p style="font-size: 28px; font-weight: 700; letter-spacing: 8px; text-align: center; margin: 24px 0; color: #111; font-variant-numeric: tabular-nums;">
        ${escapeHtml(opts.code)}
      </p>
      <p style="font-size: 12px; color: #777;">Bu kod 15 dakika içinde geçerlidir. Talebi siz yapmadıysanız bu e-postayı yok sayabilirsiniz.</p>
      <p style="font-size: 12px; color: #999; margin-top: 32px;">— ${escapeHtml(SITE.name)}</p>
    </div>
  `;

  return { subject, text, html };
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
