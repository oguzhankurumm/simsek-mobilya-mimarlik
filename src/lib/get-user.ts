import "server-only";
import { cookies } from "next/headers";
import {
  AUTH_COOKIE_NAME,
  ADMIN_COOKIE_NAME,
  verifyToken,
  type TokenPayload,
} from "./auth";
import { prisma } from "./prisma";

// Server helper. Reads the auth cookie, verifies the JWT, returns the user
// record or null. Used by layouts + API routes to gate access without
// loading the full Prisma client on every middleware run (proxy.ts stays
// next-intl-only).

// Verify the JWT AND that its session hasn't been revoked (logout, password
// reset, or expiry). Returns the token payload or null. Tokens minted before
// session-binding (no `sid`) pass on signature alone and age out within one
// TTL window. Fails CLOSED on a DB error — a transient outage must not let a
// revoked or stale token through.
export async function verifySession(
  token: string,
): Promise<TokenPayload | null> {
  const payload = await verifyToken(token);
  if (!payload) return null;
  if (!payload.sid) return payload; // legacy token, no session to check
  try {
    const session = await prisma.session.findUnique({
      where: { id: payload.sid },
      select: { userId: true, expiresAt: true },
    });
    if (
      !session ||
      session.userId !== payload.userId ||
      session.expiresAt <= new Date()
    ) {
      return null;
    }
    return payload;
  } catch {
    return null; // fail closed
  }
}

export async function getCurrentUser(opts?: { admin?: boolean }) {
  const cookieName = opts?.admin ? ADMIN_COOKIE_NAME : AUTH_COOKIE_NAME;
  const token = (await cookies()).get(cookieName)?.value;
  if (!token) return null;
  const payload = await verifySession(token);
  if (!payload) return null;
  // Cheap pre-check on the token's claimed role before the DB round-trip.
  if (opts?.admin && payload.role !== "ADMIN") return null;

  try {
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: {
        id: true,
        email: true,
        phone: true,
        name: true,
        role: true,
        createdAt: true,
      },
    });
    if (!user) return null; // user deleted — token is stale
    // Re-check the role from the DB, not the (possibly stale) JWT: a demoted
    // admin must lose /admin access immediately, not at JWT expiry.
    if (opts?.admin && user.role !== "ADMIN") return null;
    return user;
  } catch {
    // DB unavailable — fail closed. Trusting the JWT payload here would let a
    // demoted admin or revoked session through during an outage.
    return null;
  }
}

export async function requireAdminOrRedirect(redirectTo = "/admin/login") {
  const user = await getCurrentUser({ admin: true });
  if (!user) {
    const { redirect } = await import("next/navigation");
    redirect(redirectTo);
  }
  return user!;
}
