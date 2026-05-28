import "server-only";
import { prisma } from "./prisma";
import { clientIpFromRequest } from "./rate-limit";

// Fire-and-forget admin audit logging. Every mutating admin endpoint
// calls logAdminAction(); failure to insert never blocks the request.
// Resource names are lowercase + singular ("order", "product", "iban")
// for grouping in queries.

interface LogInput {
  admin: { id: string; email: string };
  request?: Request;
  action: string;
  resource: string;
  resourceId?: string | null;
  detail?: Record<string, unknown>;
}

export async function logAdminAction(input: LogInput): Promise<void> {
  try {
    await prisma.auditLog.create({
      data: {
        adminId: input.admin.id,
        adminEmail: input.admin.email,
        action: input.action,
        resource: input.resource,
        resourceId: input.resourceId ?? null,
        detail: input.detail ? JSON.stringify(input.detail).slice(0, 4000) : null,
        ip: input.request ? clientIpFromRequest(input.request) : null,
      },
    });
  } catch {
    // Log table may not exist yet on a stale DB; swallow rather than
    // failing the parent request.
  }
}
