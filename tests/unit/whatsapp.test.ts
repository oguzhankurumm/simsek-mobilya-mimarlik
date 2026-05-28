import { describe, expect, it } from "vitest";
import {
  buildOrderReceiptMessage,
  buildProductInquiryMessage,
  buildWhatsappUrl,
  normalizeE164,
} from "@/lib/whatsapp";

describe("whatsapp", () => {
  describe("normalizeE164", () => {
    it("keeps already-E.164 input", () => {
      expect(normalizeE164("+905326463919")).toBe("+905326463919");
    });
    it("turns leading 0 into +9...", () => {
      expect(normalizeE164("05326463919")).toBe("+905326463919");
    });
    it("turns plain 90... into +90...", () => {
      expect(normalizeE164("905326463919")).toBe("+905326463919");
    });
  });

  describe("buildWhatsappUrl", () => {
    it("produces wa.me URL with encoded text", () => {
      const u = buildWhatsappUrl("+905326463919", "merhaba dünya");
      expect(u).toBe(
        "https://wa.me/905326463919?text=merhaba%20d%C3%BCnya",
      );
    });
  });

  describe("buildOrderReceiptMessage", () => {
    it("includes order number, total, and item lines", () => {
      const m = buildOrderReceiptMessage({
        orderNumber: "SM-ABCD2345",
        totalTl: "12.500,00 ₺",
        items: [
          { name: "Koltuk", quantity: 1, unitPriceTl: "12.500,00 ₺" },
        ],
      });
      expect(m).toContain("SM-ABCD2345");
      expect(m).toContain("Koltuk × 1");
      expect(m).toContain("Tutar: 12.500,00 ₺");
    });
  });

  describe("buildProductInquiryMessage", () => {
    it("includes product link", () => {
      const m = buildProductInquiryMessage({
        productName: "Yağlı Meşe Masa",
        productSlug: "yagli-mese-masa",
        baseUrl: "https://simsekmobilya.com",
      });
      expect(m).toContain("Yağlı Meşe Masa");
      expect(m).toContain(
        "https://simsekmobilya.com/urunler/yagli-mese-masa",
      );
    });
  });
});
