import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { AUTH_COOKIE_NAME, ADMIN_COOKIE_NAME } from "@/lib/auth";

export const runtime = "nodejs";

export async function POST() {
  const store = await cookies();
  store.delete(AUTH_COOKIE_NAME);
  store.delete(ADMIN_COOKIE_NAME);
  return NextResponse.json({ ok: true });
}
