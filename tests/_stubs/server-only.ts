// Vitest alias target. The real `server-only` package throws when imported
// outside an RSC build; in tests we treat it as a no-op so server-only
// helpers can be exercised in isolation.
export {};
