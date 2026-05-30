import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/get-user";
import { parseCsv } from "@/lib/csv-parse";
import { slugify } from "@/lib/utils";
import { logAdminAction } from "@/lib/audit-log";

export const runtime = "nodejs";

// Bulk product import. POST a CSV file (multipart/form-data, field "file");
// rows that pass validation are upserted by `slug`. Errors per row are
// collected and returned alongside successes so the admin can fix + retry.
//
// Expected columns (header row, in any order):
//   name (required)
//   slug (optional, auto-generated from name)
//   category (required — by slug; must exist)
//   originalPrice (required, TL with dot or comma decimal)
//   salePrice (optional, defaults to originalPrice)
//   stock (optional, defaults to 0)
//   description (optional)
//   featured (optional, "true"/"1"/"yes"/"evet")
//   active (optional, defaults to true)
//   imageUrl (optional)
//   widthCm, depthCm, heightCm (optional ints)
//   material (optional, comma-separated)
//   color (optional, comma-separated)
//   room (optional)

const MAX_ROWS = 500;
const MAX_BYTES = 2 * 1024 * 1024;

const rowSchema = z.object({
  name: z.string().min(2).max(200),
  slug: z.string().optional(),
  category: z.string().min(1),
  originalPrice: z.string().min(1),
  salePrice: z.string().optional(),
  stock: z.string().optional(),
  description: z.string().optional(),
  featured: z.string().optional(),
  active: z.string().optional(),
  imageUrl: z.string().optional(),
  widthCm: z.string().optional(),
  depthCm: z.string().optional(),
  heightCm: z.string().optional(),
  material: z.string().optional(),
  color: z.string().optional(),
  room: z.string().optional(),
});

function parsePrice(value: string): number {
  // Accept "1.234,56" (TR) and "1234.56" (en).
  const normalized = value
    .replace(/\s/g, "")
    .replace(/\./g, "")
    .replace(",", ".");
  const n = Number(normalized);
  return Number.isFinite(n) ? n : NaN;
}

function parseBool(value: string | undefined, fallback: boolean): boolean {
  if (!value) return fallback;
  return /^(true|1|yes|evet)$/i.test(value.trim());
}

function parseIntOrNull(value: string | undefined): number | null {
  if (value === undefined) return null;
  const t = value.trim();
  // Strict: reject "12abc"/"3 adet" (parseInt would silently return 12/3).
  if (!/^-?\d+$/.test(t)) return null;
  const n = Number(t);
  return Number.isFinite(n) ? n : null;
}

function splitList(value: string | undefined): string[] {
  if (!value) return [];
  return value
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
}

export async function POST(req: Request) {
  const admin = await getCurrentUser({ admin: true });
  if (!admin) {
    return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  }

  const form = await req.formData().catch(() => null);
  const file = form?.get("file");
  if (!(file instanceof Blob)) {
    return NextResponse.json({ error: "CSV dosyası bulunamadı" }, { status: 400 });
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json(
      { error: "Dosya 2MB&apos;dan büyük" },
      { status: 413 },
    );
  }
  const text = await file.text();
  const { rows } = parseCsv(text);
  if (rows.length === 0) {
    return NextResponse.json(
      { error: "CSV boş veya geçersiz" },
      { status: 400 },
    );
  }
  if (rows.length > MAX_ROWS) {
    return NextResponse.json(
      { error: `En fazla ${MAX_ROWS} satır içe aktarılabilir` },
      { status: 413 },
    );
  }

  const categories = await prisma.category.findMany({
    select: { id: true, slug: true },
  });
  const categoryBySlug = new Map(categories.map((c) => [c.slug, c.id]));

  const errors: { row: number; message: string }[] = [];
  let created = 0;
  let updated = 0;

  for (let i = 0; i < rows.length; i++) {
    const lineNo = i + 2; // header + 1-based
    const raw = rows[i];
    const parsed = rowSchema.safeParse(raw);
    if (!parsed.success) {
      errors.push({
        row: lineNo,
        message:
          parsed.error.issues[0]?.message ??
          "Geçersiz satır (zorunlu alan eksik)",
      });
      continue;
    }
    const data = parsed.data;

    const categoryId = categoryBySlug.get(data.category.trim());
    if (!categoryId) {
      errors.push({
        row: lineNo,
        message: `Kategori bulunamadı: "${data.category}"`,
      });
      continue;
    }

    const original = parsePrice(data.originalPrice);
    if (!Number.isFinite(original) || original < 0) {
      errors.push({ row: lineNo, message: "Geçersiz orijinal fiyat" });
      continue;
    }
    const sale = data.salePrice ? parsePrice(data.salePrice) : original;
    if (!Number.isFinite(sale) || sale < 0) {
      errors.push({ row: lineNo, message: "Geçersiz satış fiyatı" });
      continue;
    }

    const slug = (data.slug || slugify(data.name)).trim();
    // Stock drives overselling, so a malformed value is a row error — not a
    // silent 0 (parseInt("3 adet") would have become 3).
    let stock = 0;
    if (data.stock !== undefined && data.stock.trim() !== "") {
      const t = data.stock.trim();
      if (!/^\d+$/.test(t)) {
        errors.push({
          row: lineNo,
          message: `Geçersiz stok değeri: "${data.stock}"`,
        });
        continue;
      }
      stock = Number(t);
    }
    const discountPercent =
      original > 0 ? Math.max(0, Math.round(((original - sale) / original) * 100)) : 0;
    const featured = parseBool(data.featured, false);
    const active = parseBool(data.active, true);

    try {
      const existing = await prisma.product.findUnique({ where: { slug } });
      const payload = {
        name: data.name,
        slug,
        categoryId,
        description: data.description ?? "",
        originalPrice: new Prisma.Decimal(original),
        salePrice: new Prisma.Decimal(sale),
        discountPercent,
        stock,
        featured,
        active,
        widthCm: parseIntOrNull(data.widthCm),
        depthCm: parseIntOrNull(data.depthCm),
        heightCm: parseIntOrNull(data.heightCm),
        material: splitList(data.material),
        color: splitList(data.color),
        room: data.room?.trim() || null,
      };

      if (existing) {
        await prisma.product.update({ where: { id: existing.id }, data: payload });
        updated += 1;
      } else {
        // Product + its main image in one transaction so a failed image insert
        // doesn't leave a product with no main image counted as "created".
        await prisma.$transaction(async (tx) => {
          const product = await tx.product.create({ data: payload });
          if (data.imageUrl) {
            await tx.productImage.create({
              data: {
                productId: product.id,
                url: data.imageUrl,
                isMain: true,
                displayOrder: 0,
              },
            });
          }
        });
        created += 1;
      }
    } catch (err) {
      errors.push({
        row: lineNo,
        message: err instanceof Error ? err.message.slice(0, 200) : "Kaydedilemedi",
      });
    }
  }

  await logAdminAction({
    admin: { id: admin.id, email: admin.email },
    request: req,
    action: "PRODUCT_BULK_IMPORT",
    resource: "product",
    detail: {
      totalRows: rows.length,
      created,
      updated,
      errors: errors.length,
    },
  });

  return NextResponse.json({
    ok: true,
    total: rows.length,
    created,
    updated,
    errors,
  });
}
