import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { hashPassword, sha256 } from "@/lib/auth";

export const runtime = "nodejs";

const bodySchema = z.object({
  email: z.string().email(),
  code: z.string().length(6),
  newPassword: z.string().min(8).max(128),
});

export async function POST(req: Request) {
  const json = await req.json().catch(() => null);
  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Geçersiz veri" }, { status: 400 });
  }
  const { email, code, newPassword } = parsed.data;
  const codeHash = sha256(code);

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    return NextResponse.json({ error: "Geçersiz kod" }, { status: 400 });
  }

  // Atomic: mark used only if not already used. updateMany returns count;
  // 0 means someone else claimed it or it never existed.
  const updated = await prisma.passwordReset.updateMany({
    where: {
      userId: user.id,
      codeHash,
      used: false,
      expiresAt: { gt: new Date() },
    },
    data: { used: true },
  });
  if (updated.count === 0) {
    return NextResponse.json(
      { error: "Kod geçersiz veya süresi dolmuş" },
      { status: 400 },
    );
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { passwordHash: await hashPassword(newPassword) },
  });

  // Optionally invalidate all sessions on password reset.
  await prisma.session.deleteMany({ where: { userId: user.id } });

  return NextResponse.json({ ok: true });
}
