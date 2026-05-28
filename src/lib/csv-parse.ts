// Minimal RFC 4180 CSV parser. Handles quoted fields with embedded
// commas, doubled quotes, \r\n + \n line endings, and skips a leading
// UTF-8 BOM. Returns an array-of-records keyed by the header row.
//
// We don't pull in `papaparse` (~20KB) because we only parse small
// admin uploads server-side; this is ~60 lines and zero deps.

export interface ParsedCsv {
  headers: string[];
  rows: Record<string, string>[];
}

export function parseCsv(input: string): ParsedCsv {
  let text = input;
  if (text.charCodeAt(0) === 0xfeff) text = text.slice(1);

  const cells: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQuotes) {
      if (c === '"') {
        if (text[i + 1] === '"') {
          cell += '"';
          i += 1;
        } else {
          inQuotes = false;
        }
      } else {
        cell += c;
      }
      continue;
    }
    if (c === '"') {
      inQuotes = true;
      continue;
    }
    if (c === ",") {
      row.push(cell);
      cell = "";
      continue;
    }
    if (c === "\n" || c === "\r") {
      // Treat \r\n as a single line terminator.
      if (c === "\r" && text[i + 1] === "\n") i += 1;
      row.push(cell);
      cells.push(row);
      row = [];
      cell = "";
      continue;
    }
    cell += c;
  }
  if (cell !== "" || row.length > 0) {
    row.push(cell);
    cells.push(row);
  }

  if (cells.length === 0) return { headers: [], rows: [] };

  const [headerRow, ...bodyRows] = cells;
  const headers = headerRow.map((h) => h.trim());

  const rows: Record<string, string>[] = [];
  for (const r of bodyRows) {
    // Skip wholly-empty rows (trailing newlines etc.).
    if (r.every((c) => c.trim() === "")) continue;
    const record: Record<string, string> = {};
    headers.forEach((h, i) => {
      record[h] = (r[i] ?? "").trim();
    });
    rows.push(record);
  }

  return { headers, rows };
}
