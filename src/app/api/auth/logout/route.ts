import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { AUTH_COOKIE_NAME, ADMIN_COOKIE_NAME, verifyToken } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function POST() {
  const store = await cookies();
  // Revoke the bound session row server-side so a copied JWT can't be replayed
  // after logout, then clear both cookies.
  for (const name of [AUTH_COOKIE_NAME, ADMIN_COOKIE_NAME]) {
    const token = store.get(name)?.value;
    if (token) {
      const payload = await verifyToken(token);
      if (payload?.sid) {
        await prisma.session
          .deleteMany({ where: { id: payload.sid } })
          .catch((e) => console.error("LOGOUT_SESSION_DELETE", e));
      }
    }
    store.delete(name);
  }
  return NextResponse.json({ ok: true });
}
