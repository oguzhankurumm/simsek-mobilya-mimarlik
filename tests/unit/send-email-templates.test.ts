import { describe, expect, it, vi } from "vitest";

// The send-email module imports "server-only" + "@/config/site". The
// templates are pure; the actual Resend call lives in sendEmail() which we
// don't exercise here.

describe("send-email templates", () => {
  it("buildOrderConfirmationEmail includes order number, total, items", async () => {
    const { buildOrderConfirmationEmail } = await import("@/lib/send-email");
    const { subject, text, html } = buildOrderConfirmationEmail({
      recipientName: "Ada Lovelace",
      orderNumber: "SM-ABCDEFGH",
      totalTl: "12.500,00 ₺",
      ibanBankName: "Garanti BBVA",
      ibanNumber: "TR00 0000 0000 0000",
      ibanHolder: "Şimşek Mobilya & Mimarlık",
      whatsappLink: "https://wa.me/905326463919?text=test",
      items: [
        { name: "Koltuk", quantity: 1, subtotalTl: "12.500,00 ₺" },
      ],
    });
    expect(subject).toContain("SM-ABCDEFGH");
    expect(text).toContain("Ada Lovelace");
    expect(text).toContain("12.500,00 ₺");
    expect(text).toContain("Koltuk × 1");
    expect(text).toContain("Garanti BBVA");
    expect(html).toContain("SM-ABCDEFGH");
  });

  it("buildOrderStatusEmail picks the right body for each status", async () => {
    const { buildOrderStatusEmail } = await import("@/lib/send-email");
    const shipped = buildOrderStatusEmail({
      recipientName: "Ada",
      orderNumber: "SM-XYZ",
      status: "SHIPPED",
      trackingUrl: "https://example.com/track",
    });
    expect(shipped.subject).toContain("Kargoda");
    expect(shipped.text).toContain("Yakında elinizde");

    const cancelled = buildOrderStatusEmail({
      recipientName: "Ada",
      orderNumber: "SM-XYZ",
      status: "CANCELLED",
      trackingUrl: "https://example.com/track",
    });
    expect(cancelled.subject).toContain("İptal");
    expect(cancelled.text).toContain("iade prosedürü");
  });

  it("buildStockBackInEmail includes product name + URL", async () => {
    const { buildStockBackInEmail } = await import("@/lib/send-email");
    const { subject, text, html } = buildStockBackInEmail({
      recipientName: "Ada",
      productName: "Ceviz Modüler TV Ünitesi",
      productUrl: "https://simsekmobilya.com/urunler/ceviz",
    });
    expect(subject).toContain("Ceviz Modüler TV Ünitesi");
    expect(text).toContain("Ceviz Modüler TV Ünitesi");
    expect(text).toContain("https://simsekmobilya.com/urunler/ceviz");
    expect(html).toContain("simsekmobilya.com/urunler/ceviz");
  });

  it("buildPasswordResetEmail surfaces the reset code prominently", async () => {
    const { buildPasswordResetEmail } = await import("@/lib/send-email");
    const { subject, text, html } = buildPasswordResetEmail({
      recipientName: "Ada",
      code: "482917",
    });
    expect(subject).toContain("Şifre Sıfırlama");
    expect(text).toContain("482917");
    expect(html).toContain("482917");
  });

  vi.unstubAllEnvs();
});
