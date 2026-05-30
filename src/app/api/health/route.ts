import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

// Plain GET /api/health for uptime checks (Vercel Healthcheck, Better Uptime,
// Pingdom). Reports DB reachability + a coarse-grained latency number so a
// degraded DB shows up before user requests do.

export async function GET() {
  const startedAt = Date.now();
  let dbStatus: "ok" | "down" = "down";
  let dbLatencyMs: number | null = null;

  try {
    const dbStart = Date.now();
    // 1=1 — cheapest no-op query Prisma supports; doesn't hit any user table.
    await prisma.$queryRaw`SELECT 1`;
    dbLatencyMs = Date.now() - dbStart;
    dbStatus = "ok";
  } catch (err) {
    // Log the detail server-side; the public body stays coarse so we don't leak
    // DB provider / connection internals to anonymous callers.
    console.error("HEALTH_DB_ERROR", err);
  }

  const body = {
    ok: dbStatus === "ok",
    timestamp: new Date().toISOString(),
    uptime_check_ms: Date.now() - startedAt,
    db: {
      status: dbStatus,
      latency_ms: dbLatencyMs,
    },
    runtime: "nodejs",
    node_env: process.env.NODE_ENV,
  };

  return NextResponse.json(body, {
    status: body.ok ? 200 : 503,
    headers: { "Cache-Control": "no-store" },
  });
}
