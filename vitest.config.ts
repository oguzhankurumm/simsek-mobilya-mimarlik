import { defineConfig } from "vitest/config";
import path from "node:path";

export default defineConfig({
  test: {
    environment: "happy-dom",
    globals: true,
    include: ["tests/unit/**/*.test.ts", "tests/unit/**/*.test.tsx"],
    coverage: {
      provider: "v8",
      reporter: ["text", "lcov"],
      include: ["src/lib/**/*.ts", "src/i18n/**/*.ts", "src/content/**/*.ts"],
      exclude: ["**/*.d.ts", "**/types.ts"],
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      // server-only is a marker package from Next.js that throws on the
      // client. Vitest doesn't know about Next's server boundary, so we
      // resolve it to an empty module so server-only files can be tested.
      "server-only": path.resolve(__dirname, "./tests/_stubs/server-only.ts"),
    },
  },
});
