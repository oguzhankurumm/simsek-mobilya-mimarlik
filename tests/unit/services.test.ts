import { describe, expect, it } from "vitest";
import { SERVICES, PROCESS_STEPS } from "@/content/services";

describe("services content", () => {
  it("declares 4 services", () => {
    expect(SERVICES).toHaveLength(4);
  });

  it("each service has a unique slug", () => {
    const slugs = SERVICES.map((s) => s.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it("each service has parallel TR/EN content", () => {
    for (const s of SERVICES) {
      expect(s.titleTr.length).toBeGreaterThan(0);
      expect(s.titleEn.length).toBeGreaterThan(0);
      expect(s.bulletsTr.length).toBe(s.bulletsEn.length);
    }
  });

  it("declares 4 process steps", () => {
    expect(PROCESS_STEPS).toHaveLength(4);
  });

  it("process steps are numbered 01..04", () => {
    expect(PROCESS_STEPS.map((p) => p.n)).toEqual(["01", "02", "03", "04"]);
  });
});
