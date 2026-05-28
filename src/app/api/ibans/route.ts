import { NextResponse } from "next/server";
import { getActiveIbans } from "@/lib/ibans";

export const runtime = "nodejs";
export const revalidate = 60;

export async function GET() {
  const ibans = await getActiveIbans();
  return NextResponse.json(ibans);
}
