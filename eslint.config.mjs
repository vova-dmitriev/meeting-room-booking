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
    files: ["src/**/*.tsx", "app/**/*.tsx"],
    ignores: ["**/*.stories.tsx"],
    rules: { "frontend/one-component": "error", "frontend/named-props": "error", "no-restricted-syntax": ["error", ...testIdRules] },
  },
  {
    files: ["src/**/*.{ts,tsx}"],
    ignores: ["**/*store.ts", "**/*.stories.tsx"],
    rules: { "no-restricted-syntax": ["error", ...testIdRules, ...zustandConsumerRules] },
  },
  {
    files: ["src/{_app,_pages,widgets,features,entities}/**/*.tsx", "app/**/*.tsx"],
    rules: { "no-restricted-syntax": ["error", ...testIdRules, ...primitiveRules, ...zustandConsumerRules] },
  },
  {
    files: ["**/*.stories.tsx"],
    rules: { "no-restricted-syntax": ["error", ...testIdRules, ...selectorRules, ...storyRules, ...storyTranslationRules] },
  },
  { files: ["tests/**/*.{ts,tsx}"], rules: { "no-restricted-syntax": ["error", ...selectorRules] } },
])
