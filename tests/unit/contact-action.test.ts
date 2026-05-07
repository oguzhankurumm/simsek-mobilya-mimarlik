import { describe, expect, it } from "vitest";
import { contactFormSchema } from "@/lib/contact-schema";

describe("contactFormSchema", () => {
  const valid = {
    name: "Mehmet Yılmaz",
    email: "mehmet@example.com",
    phone: "+905326463919",
    service: "custom" as const,
    message: "Salonumuz için bir mobilya programı düşünüyoruz.",
    locale: "tr" as const,
    website: "",
  };

  it("accepts a complete payload", () => {
    const result = contactFormSchema.safeParse(valid);
    expect(result.success).toBe(true);
  });

  it("rejects an empty name", () => {
    const result = contactFormSchema.safeParse({ ...valid, name: "" });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.message).toBe("nameRequired");
    }
  });

  it("rejects an invalid email", () => {
    const result = contactFormSchema.safeParse({ ...valid, email: "not-an-email" });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.message).toBe("emailInvalid");
    }
  });

  it("rejects a too-short message", () => {
    const result = contactFormSchema.safeParse({ ...valid, message: "hi" });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.message).toBe("messageMin");
    }
  });

  it("treats a non-empty website (honeypot) as a validation failure", () => {
    const result = contactFormSchema.safeParse({ ...valid, website: "http://spam.example" });
    expect(result.success).toBe(false);
  });

  it("requires a locale value", () => {
    const rest = { ...valid } as Partial<typeof valid>;
    delete rest.locale;
    const result = contactFormSchema.safeParse(rest);
    expect(result.success).toBe(false);
  });
});
