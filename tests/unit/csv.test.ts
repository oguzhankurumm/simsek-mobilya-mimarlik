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

  it("defangs CSV formula injection", () => {
    const out = toCsv(
      [
        { evil: "=cmd|'/c calc'!A1" },
        { evil: "+sum(A1:A9)" },
        { evil: "-2+3" },
        { evil: "@SUM(1,2)" },
        { evil: "\ttab-prefixed" },
        { evil: "safe value" },
      ],
      [{ key: "evil", header: "Cell" }],
    );
    // Every dangerous prefix should get a leading single-quote, then the
    // cell is wrapped in quotes because it contains the comma/quote/etc.
    // (or is unquoted if no special chars). Either way the leading byte
    // after the opening quote (if any) must be `'`.
    expect(out).toContain("'=cmd|'");
    expect(out).toContain("'+sum");
    expect(out).toContain("'-2+3");
    expect(out).toContain("'@SUM");
    expect(out).toContain("'\ttab-prefixed");
    // Safe cell unchanged.
    expect(out).toContain("safe value");
    expect(out).not.toContain("'safe");
  });
});
