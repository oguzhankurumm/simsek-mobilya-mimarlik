import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/get-user";

export const runtime = "nodejs";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ user: null }, { status: 200 });
  // Don't expose phone (PII) from the session-probe endpoint; account pages
  // that need it read it from their own server-side queries.
  const { id, email, name, role, createdAt } = user;
  return NextResponse.json({ user: { id, email, name, role, createdAt } });
}
