import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { hashPassword, sha256 } from "@/lib/auth";
import { rateLimit, clientIpFromRequest } from "@/lib/rate-limit";

export const runtime = "nodejs";

const HOUR_MS = 60 * 60 * 1000;

const bodySchema = z.object({
  email: z.string().email(),
  code: z.string().length(6),
  newPassword: z.string().min(8).max(128),
});

export async function POST(req: Request) {
  // A 6-digit code has only 1,000,000 combinations. Without a rate limit an
  // attacker who knows an email can brute-force it inside the 15-minute window.
  // 10/hour/IP + 5/hour/email throttles that to nothing.
  const ip = clientIpFromRequest(req);
  if (!(await rateLimit(`reset:ip:${ip}`, 10, HOUR_MS)).allowed) {
    return NextResponse.json(
      { error: "Çok fazla deneme. Lütfen biraz bekleyin." },
      { status: 429 },
    );
  }

  const json = await req.json().catch(() => null);
  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Geçersiz veri" }, { status: 400 });
  }
  const { email, code, newPassword } = parsed.data;

  if (!(await rateLimit(`reset:email:${email.toLowerCase()}`, 5, HOUR_MS)).allowed) {
    return NextResponse.json(
      { error: "Çok fazla deneme. Birkaç dakika sonra tekrar deneyin." },
      { status: 429 },
    );
  }

  const codeHash = sha256(code);
  // One uniform failure response so "no such email" and "wrong code" are
  // indistinguishable (no user-enumeration oracle).
  const invalid = NextResponse.json(
    { error: "Kod geçersiz veya süresi dolmuş" },
    { status: 400 },
  );

  // Hash up front and unconditionally: every reset attempt pays one bcrypt
  // regardless of whether the email or code is valid, so response timing can't
  // distinguish the paths. The rate limit bounds the wasted work.
  const passwordHash = await hashPassword(newPassword);

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return invalid;

  // Consume the code, set the new password, and purge other sessions as ONE
  // atomic unit. Previously these were separate writes: if the password update
  // failed after the code was marked used, the code was burned and the password
  // never changed — a silent lockout.
  try {
    const ok = await prisma.$transaction(async (tx) => {
      const claimed = await tx.passwordReset.updateMany({
        where: {
          userId: user.id,
          codeHash,
          used: false,
          expiresAt: { gt: new Date() },
        },
        data: { used: true },
      });
      if (claimed.count === 0) return false;
      await tx.user.update({
        where: { id: user.id },
        data: { passwordHash },
      });
      // Reset invalidates every existing session (now actually enforced — see
      // verifySession in get-user.ts).
      await tx.session.deleteMany({ where: { userId: user.id } });
      return true;
    });
    if (!ok) return invalid;
  } catch (err) {
    console.error("PASSWORD_RESET_ERROR", err);
    return NextResponse.json(
      { error: "Şifre güncellenemedi. Lütfen tekrar deneyin." },
      { status: 500 },
    );
  }

  return NextResponse.json({ ok: true });
}
