import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

export default defineConfig([
  ...nextVitals,
  ...nextTs,
  globalIgnores([".next/**", "out/**", "coverage/**", "next-env.d.ts"]),
  {
    rules: {
      complexity: ["error", 10],
      "max-lines-per-function": ["error", { max: 50, skipBlankLines: true, skipComments: true }],
      "max-depth": ["error", 3],
      "max-lines": ["error", { max: 300, skipBlankLines: true, skipComments: true }],
      "no-console": "error",
      eqeqeq: "error",
      "@typescript-eslint/no-explicit-any": "error",
      "@typescript-eslint/ban-ts-comment": "error",
    },
  },
  {
    // los archivos de prueba pueden ser más largos
    files: ["tests/**", "**/*.test.ts", "**/*.test.tsx"],
    rules: { "max-lines-per-function": "off", "max-lines": "off" },
  },
]);
