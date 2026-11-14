import react from "@vitejs/plugin-react";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) },
  },
  test: {
    environment: "node",
    include: ["tests/**/*.test.{ts,tsx}"],
    coverage: {
      provider: "v8",
      include: ["src/services/**"],
      // Si alguien baja el umbral, el `check` se rompe: lo pide la hoja de calidad.
      thresholds: { lines: 80, functions: 80, statements: 80, branches: 70 },
    },
  },
});
