import { describe, expect, it } from "vitest";
import { routing } from "@/i18n/routing";

describe("i18n routing", () => {
  it("exposes only tr + en locales", () => {
    expect(routing.locales).toEqual(["tr", "en"]);
  });

  it("uses tr as the default locale", () => {
    expect(routing.defaultLocale).toBe("tr");
  });

  it("uses as-needed prefix strategy", () => {
    expect(routing.localePrefix).toBe("as-needed");
  });

  it("maps localized pathnames for portfolio", () => {
    const map = routing.pathnames["/portfolio"];
    if (typeof map === "string") {
      throw new Error("Expected pathname object for /portfolio");
    }
    expect(map.tr).toBe("/calismalar");
    expect(map.en).toBe("/work");
  });

  it("maps localized pathnames for services", () => {
    const map = routing.pathnames["/services"];
    if (typeof map === "string") {
      throw new Error("Expected pathname object for /services");
    }
    expect(map.tr).toBe("/hizmetler");
    expect(map.en).toBe("/services");
  });

  it("maps localized pathnames for about and contact", () => {
    const about = routing.pathnames["/about"];
    const contact = routing.pathnames["/contact"];
    if (typeof about === "string" || typeof contact === "string") {
      throw new Error("Expected pathname objects");
    }
    expect(about.tr).toBe("/hakkimizda");
    expect(contact.tr).toBe("/iletisim");
    expect(about.en).toBe("/about");
    expect(contact.en).toBe("/contact");
  });
});
