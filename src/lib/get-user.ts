import "server-only";
import { cookies } from "next/headers";
import { AUTH_COOKIE_NAME, ADMIN_COOKIE_NAME, verifyToken } from "./auth";
import { prisma } from "./prisma";

// Server helper. Reads the auth cookie, verifies the JWT, returns the user
// record or null. Used by layouts + API routes to gate access without
// loading the full Prisma client on every middleware run (proxy.ts stays
// next-intl-only).

export async function getCurrentUser(opts?: { admin?: boolean }) {
  const cookieName = opts?.admin ? ADMIN_COOKIE_NAME : AUTH_COOKIE_NAME;
  const token = (await cookies()).get(cookieName)?.value;
  if (!token) return null;
  const payload = await verifyToken(token);
  if (!payload) return null;
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
    return user;
  } catch {
    // DB unavailable — fall back to JWT payload only (degraded UX but no
    // false negatives on auth check).
    return {
      id: payload.userId,
      email: "",
      phone: null,
      name: "",
      role: payload.role,
      createdAt: new Date(),
    };
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
