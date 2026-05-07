import { describe, expect, it } from "vitest";
import { cn, slugify, shimmerDataUrl } from "@/lib/utils";

describe("cn", () => {
  it("merges classnames", () => {
    expect(cn("p-2", "m-1")).toBe("p-2 m-1");
  });
  it("dedupes conflicting tailwind utilities", () => {
    expect(cn("p-2", "p-4")).toBe("p-4");
  });
  it("handles falsy values", () => {
    expect(cn("a", false && "b", null, undefined, "c")).toBe("a c");
  });
});

describe("slugify", () => {
  it("strips Turkish diacritics", () => {
    expect(slugify("Şimşek Mobilya")).toBe("simsek-mobilya");
  });
  it("lowercases and replaces spaces", () => {
    expect(slugify("Atelier  Beşiktaş Konağı")).toBe("atelier-besiktas-konagi");
  });
  it("strips punctuation", () => {
    expect(slugify("Hello, World!")).toBe("hello-world");
  });
  it("clamps to 80 chars", () => {
    const long = "a".repeat(120);
    expect(slugify(long)).toHaveLength(80);
  });
});

describe("shimmerDataUrl", () => {
  it("returns a base64 svg url", () => {
    const url = shimmerDataUrl(40, 30);
    expect(url.startsWith("data:image/svg+xml;base64,")).toBe(true);
  });
  it("caches the same dimensions", () => {
    const a = shimmerDataUrl(20, 20);
    const b = shimmerDataUrl(20, 20);
    expect(a).toBe(b);
  });
});
