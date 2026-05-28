import { describe, expect, it } from "vitest";
import { toCsv } from "@/lib/csv";

describe("csv", () => {
  it("prepends the UTF-8 BOM", () => {
    const out = toCsv([{ a: "x" }], [{ key: "a", header: "A" }]);
    // ﻿ == UTF-8 BOM.
    expect(out.charCodeAt(0)).toBe(0xfeff);
  });

  it("emits header + body rows", () => {
    const out = toCsv(
      [
        { name: "Ada", age: 31 },
        { name: "Pekin", age: 4 },
      ],
      [
        { key: "name", header: "Ad" },
        { key: "age", header: "Yaş" },
      ],
    );
    const lines = out.replace(/^﻿/, "").trim().split("\n");
    expect(lines).toEqual(["Ad,Yaş", "Ada,31", "Pekin,4"]);
  });

  it("quotes fields that contain commas, quotes, or newlines", () => {
    const out = toCsv(
      [{ note: 'has "quotes" and, comma\nand newline' }],
      [{ key: "note", header: "Not" }],
    );
    expect(out).toContain('"has ""quotes"" and, comma\nand newline"');
  });

  it("renders null/undefined as empty cells", () => {
    const out = toCsv(
      [{ a: null, b: undefined, c: "x" }],
      [
        { key: "a", header: "A" },
        { key: "b", header: "B" },
        { key: "c", header: "C" },
      ],
    );
    expect(out).toContain(",,x");
  });
});
