import { describe, expect, it } from "vitest";
import tr from "@/messages/tr.json";
import en from "@/messages/en.json";

function flatten(obj: unknown, prefix = ""): string[] {
  if (obj === null || obj === undefined) return [];
  if (typeof obj !== "object") return [prefix];
  const keys: string[] = [];
  for (const [k, v] of Object.entries(obj as Record<string, unknown>)) {
    const next = prefix ? `${prefix}.${k}` : k;
    if (v && typeof v === "object" && !Array.isArray(v)) {
      keys.push(...flatten(v, next));
    } else {
      keys.push(next);
    }
  }
  return keys;
}

describe("messages", () => {
  it("tr and en have the same key shape", () => {
    const trKeys = flatten(tr).sort();
    const enKeys = flatten(en).sort();
    const onlyTr = trKeys.filter((k) => !enKeys.includes(k));
    const onlyEn = enKeys.filter((k) => !trKeys.includes(k));
    if (onlyTr.length || onlyEn.length) {
      throw new Error(
        `Locale parity drift\n  Only TR: ${onlyTr.join(", ") || "—"}\n  Only EN: ${onlyEn.join(", ") || "—"}`
      );
    }
    expect(trKeys).toEqual(enKeys);
  });

  it("includes brand metadata for both locales", () => {
    expect(tr.brand.name).toBeTruthy();
    expect(en.brand.name).toBeTruthy();
  });

  it("includes contact form labels", () => {
    expect(tr.contact.form.submit).toBeTruthy();
    expect(en.contact.form.submit).toBeTruthy();
  });
});
