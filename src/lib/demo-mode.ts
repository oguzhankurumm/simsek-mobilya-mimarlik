import "server-only";

// Demo data (mock products / IBANs / WhatsApp line) is a development convenience
// for when the DB is empty or unreachable. It is OFF in production unless
// DEMO_CATALOG=1 — a real customer must never be shown fake products or a fake
// IBAN (they would "order" a demo SKU, or pay into account "TR00 0000…", and the
// order would then fail). Demo state is always RETURNED per call, never stored
// in module-level mutable state (that races across concurrent RSC renders).

export const DEMO_DATA_ENABLED =
  process.env.NODE_ENV !== "production" || process.env.DEMO_CATALOG === "1";

export function logDbFallback(where: string, detail?: unknown): void {
  // Always log (not gated on NODE_ENV) so a production DB outage is visible to
  // ops instead of silently degrading to demo / empty data.
  console.error(
    `[${where}] DB unavailable; ` +
      (DEMO_DATA_ENABLED
        ? "serving demo data."
        : "returning empty (production)."),
    detail instanceof Error ? detail.message : (detail ?? ""),
  );
}
