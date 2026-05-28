import { describe, expect, it } from "vitest";
import { parseCsv } from "@/lib/csv-parse";

describe("parseCsv", () => {
  it("parses header + body rows", () => {
    const { headers, rows } = parseCsv(`name,age\nAda,31\nPekin,4`);
    expect(headers).toEqual(["name", "age"]);
    expect(rows).toEqual([
      { name: "Ada", age: "31" },
      { name: "Pekin", age: "4" },
    ]);
  });

  it("strips a UTF-8 BOM", () => {
    const { headers } = parseCsv("﻿a,b\nx,y");
    expect(headers).toEqual(["a", "b"]);
  });

  it("handles quoted fields with commas", () => {
    const { rows } = parseCsv(`title,note\n"Koltuk, krem","has, comma"`);
    expect(rows[0]).toEqual({
      title: "Koltuk, krem",
      note: "has, comma",
    });
  });

  it("handles doubled quotes inside quoted fields", () => {
    const { rows } = parseCsv(`name\n"She said ""hi"""`);
    expect(rows[0]).toEqual({ name: 'She said "hi"' });
  });

  it("treats CRLF + LF as identical line terminators", () => {
    const a = parseCsv("a,b\r\n1,2\r\n3,4");
    const b = parseCsv("a,b\n1,2\n3,4");
    expect(a).toEqual(b);
  });

  it("skips wholly empty rows", () => {
    const { rows } = parseCsv("a,b\n1,2\n,\n3,4\n");
    expect(rows).toEqual([
      { a: "1", b: "2" },
      { a: "3", b: "4" },
    ]);
  });

  it("returns empty for empty input", () => {
    expect(parseCsv("")).toEqual({ headers: [], rows: [] });
  });

  it("round-trips with the writer (basic case)", async () => {
    const { toCsv } = await import("@/lib/csv");
    const out = toCsv(
      [{ ad: "Ada", yaş: "31" }, { ad: "Pekin", yaş: "4" }],
      [
        { key: "ad", header: "ad" },
        { key: "yaş", header: "yaş" },
      ],
    );
    const { rows } = parseCsv(out);
    expect(rows).toEqual([
      { ad: "Ada", yaş: "31" },
      { ad: "Pekin", yaş: "4" },
    ]);
  });
});
