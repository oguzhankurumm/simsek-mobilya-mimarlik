import { describe, expect, it } from "vitest";
import {
  buildOrderReceiptMessage,
  buildProductInquiryMessage,
  buildWhatsappUrl,
  normalizeE164,
} from "@/lib/whatsapp";

describe("whatsapp — edge cases", () => {
  it("normalizeE164 strips internal whitespace + dashes", () => {
    expect(normalizeE164("0 (532) 646-39-19")).toBe("+905326463919");
    expect(normalizeE164("+90 532 646 39 19")).toBe("+905326463919");
  });

  it("normalizeE164 keeps short non-TR international numbers intact-ish", () => {
    // A US number "1 555 123 4567" doesn't match Turkish rules; we still
    // produce *some* +-prefixed value rather than throwing.
    const out = normalizeE164("1 555 123 4567");
    expect(out.startsWith("+")).toBe(true);
  });

  it("wa.me URL is properly URL-encoded for multi-line message", () => {
    const url = buildWhatsappUrl(
      "+905326463919",
      "Merhaba\nSatır 2\nÇok özel karakter: %&=",
    );
    expect(url).toBe(
      "https://wa.me/905326463919?text=" +
        encodeURIComponent("Merhaba\nSatır 2\nÇok özel karakter: %&="),
    );
  });

  it("order receipt message keeps every item visible", () => {
    const msg = buildOrderReceiptMessage({
      orderNumber: "SM-Y8MB3HUM",
      totalTl: "27.500,00 ₺",
      items: [
        { name: "Ceviz Modüler TV Ünitesi", quantity: 1, unitPriceTl: "27.500,00 ₺" },
      ],
    });
    expect(msg.split("\n").length).toBeGreaterThan(3);
    expect(msg).toContain("SM-Y8MB3HUM");
    expect(msg).toContain("Ceviz Modüler TV Ünitesi × 1");
  });

  it("product inquiry message embeds the absolute product URL", () => {
    const msg = buildProductInquiryMessage({
      productName: "Yağlı Meşe Masa",
      productSlug: "yagli-mese-masa",
      baseUrl: "https://simsekmobilya.com",
    });
    expect(msg).toContain("https://simsekmobilya.com/urunler/yagli-mese-masa");
  });
});
