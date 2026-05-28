import { NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { getCurrentUser } from "@/lib/get-user";

export const runtime = "nodejs";

// Admin-only image upload to Vercel Blob. Returns the public URL the caller
// can stash in a Prisma column (product image, order receipt, hero slide,
// category cover). Limits to image/* + 5MB so we don't accidentally ingest
// the user's photo library.

const MAX_BYTES = 5 * 1024 * 1024;
const ALLOWED_PREFIXES = ["image/"];

export async function POST(req: Request) {
  const admin = await getCurrentUser({ admin: true });
  if (!admin) {
    return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  }

  const form = await req.formData().catch(() => null);
  const file = form?.get("file");
  if (!(file instanceof Blob)) {
    return NextResponse.json(
      { error: "Dosya bulunamadı" },
      { status: 400 },
    );
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json(
      { error: "Dosya 5MB'dan büyük" },
      { status: 413 },
    );
  }
  if (!ALLOWED_PREFIXES.some((p) => file.type.startsWith(p))) {
    return NextResponse.json(
      { error: "Sadece görsel yüklenebilir" },
      { status: 415 },
    );
  }

  const filename = (form?.get("filename") as string | null) ?? "upload";
  const folder = (form?.get("folder") as string | null) ?? "uploads";
  const safeFolder = folder.replace(/[^a-z0-9-]/gi, "").slice(0, 24) || "uploads";
  const ext = file.type.split("/")[1] ?? "bin";
  const path = `${safeFolder}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}-${filename.replace(/[^a-z0-9.-]/gi, "").slice(0, 60)}.${ext}`;

  try {
    const { url } = await put(path, file, {
      access: "public",
      token: process.env.BLOB_READ_WRITE_TOKEN,
    });
    return NextResponse.json({ url, pathname: path });
  } catch (err) {
    console.error("[admin-upload] failed", err);
    return NextResponse.json(
      { error: "Yükleme başarısız" },
      { status: 500 },
    );
  }
}
