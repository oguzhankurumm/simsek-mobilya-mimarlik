// Tiny CSV serializer. Quotes fields that contain comma, quote, newline,
// or carriage return; doubles inner quotes per RFC 4180. UTF-8 BOM is
// prepended so Excel opens Turkish characters correctly.

const BOM = "﻿";

function escapeCell(value: unknown): string {
  if (value === null || value === undefined) return "";
  const str = String(value);
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
