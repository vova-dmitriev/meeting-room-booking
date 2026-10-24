import stylistic from "@stylistic/eslint-plugin"
import { defineConfig, globalIgnores } from "eslint/config"
import nextVitals from "eslint-config-next/core-web-vitals"
import nextTypes from "eslint-config-next/typescript"
import storybook from "eslint-plugin-storybook"
import betterTailwindcss from "eslint-plugin-better-tailwindcss"
import { readabilityRules } from "./eslint/readability.mjs"
import frontend from "./eslint/one-component.mjs"
import { testIdRules, selectorRules, storyRules, primitiveRules, zustandConsumerRules, storyTranslationRules } from "./eslint/rules.mjs"

export default defineConfig([
  globalIgnores([
    ".next/**",
    ".vercel/**",
    "coverage/**",
    "node_modules/**",
    "next-env.d.ts",
    "storybook-static/**",
    "public/mockServiceWorker.js",
    "playwright-report/**",
    "test-results/**",
    ".superpowers/**",
  ]),
  ...nextVitals,
  ...nextTypes,
  ...storybook.configs["flat/recommended"],
  {
    files: ["**/*.{ts,tsx,mjs}"],
    plugins: { frontend },
    rules: { "frontend/file-conventions": "error" },
  },
  {
    files: ["**/*.{js,jsx,ts,tsx,mjs}"],
    plugins: { "better-tailwindcss": betterTailwindcss },
    settings: {
      "better-tailwindcss": { cwd: import.meta.dirname, entryPoint: "src/_app/styles/globals.css", rootFontSize: 16 },
    },
    rules: { "better-tailwindcss/enforce-canonical-classes": "error" },
  },
  {
    files: ["**/*.{ts,tsx,mjs}"],
    plugins: { "@stylistic": stylistic },
    rules: {
      ...readabilityRules,
      "max-lines": ["error", { max: 200 }],
      "max-len": ["error", { code: 140, ignoreUrls: true, ignoreRegExpLiterals: true }],
      "@typescript-eslint/no-explicit-any": "error",
      "@typescript-eslint/no-unused-vars": ["error", { argsIgnorePattern: "^_", varsIgnorePattern: "^_" }],
    },
  },
  {
    files: ["src/**/*.{ts,tsx}", "app/**/*.{ts,tsx}"],
    plugins: { frontend },
    rules: { "frontend/hook-callback-body": "error" },
  },
  {
    files: ["src/**/*.{ts,tsx}", "app/**/*.{ts,tsx}"],
    ignores: ["**/__spec__/**"],
    rules: { "frontend/business-data-constants": "error" },
  },
  {
    files: ["src/**/*.tsx", "app/**/*.tsx"],
    ignores: ["**/__spec__/**"],
    rules: { "frontend/root-test-ids": "error" },
  },
  {
    files: ["src/**/*.tsx", "app/**/*.tsx"],
    ignores: ["**/*.stories.tsx", "**/__spec__/**"],
    rules: {
      "frontend/one-component": "error",
      "frontend/named-props": "error",
      "no-restricted-syntax": ["error", ...testIdRules],
    },
  },
  {
    files: ["src/**/*.{ts,tsx}"],
    ignores: ["**/*store.ts", "**/*.stories.tsx", "**/__spec__/**"],
    rules: { "no-restricted-syntax": ["error", ...testIdRules, ...zustandConsumerRules] },
  },
  {
    files: ["src/{_app,_pages,widgets,features,entities}/**/*.tsx", "app/**/*.tsx"],
    ignores: ["**/__spec__/**"],
    rules: { "no-restricted-syntax": ["error", ...testIdRules, ...primitiveRules, ...zustandConsumerRules] },
  },
  {
    files: ["**/*.stories.tsx"],
    rules: { "no-restricted-syntax": ["error", ...testIdRules, ...selectorRules, ...storyRules, ...storyTranslationRules] },
  },
  {
    files: ["tests/**/*.{ts,tsx}", "**/__spec__/**/*.{ts,tsx}"],
    rules: { "no-restricted-syntax": ["error", ...selectorRules] },
  },
  {
    files: ["tests/{e2e,deployment}/**/*.{ts,tsx}", "src/**/__spec__/**/*.{ts,tsx}"],
    ignores: ["**/*.fixtures.ts", "**/fixtures.ts", "**/constants.ts"],
    plugins: { frontend },
    rules: { "frontend/test-data-constants": "error" },
  },
])
