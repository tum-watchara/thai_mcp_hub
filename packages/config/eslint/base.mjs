import js from "@eslint/js";
import tseslint from "typescript-eslint";

/**
 * Shared lint rules for every workspace package.
 * Apps extend this on top of their framework preset.
 */
export const baseRules = {
  "@typescript-eslint/no-explicit-any": "error",
  "@typescript-eslint/consistent-type-imports": ["error", { prefer: "type-imports" }],
  "@typescript-eslint/no-unused-vars": ["error", { argsIgnorePattern: "^_" }],
};

export default tseslint.config(js.configs.recommended, ...tseslint.configs.recommended, {
  rules: baseRules,
});
