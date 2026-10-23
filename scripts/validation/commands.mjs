const npm = process.platform === "win32" ? "npm.cmd" : "npm"
const script = (name, command = name) => ({ name, executable: npm, args: ["run", command] })
const installed = (step) => ({ ...step, needs: ["dependencies"] })
const sourceChecks = ["i18n", "typecheck", "lint", "lint:fsd", "lint:structure", "lint:react", "format:check", "knip"]

export const validationCommands = [
  { name: "security", executable: process.execPath, args: ["scripts/security/check.mjs", "--check-working-copy"] },
  { name: "dependencies", executable: npm, args: ["ci", "--ignore-scripts", "--no-audit", "--no-fund", "--prefer-offline"] },
  installed({ name: "i18n", executable: process.execPath, args: ["scripts/i18n/check.mjs"] }),
  ...sourceChecks.slice(1).map((name) => installed(script(name))),
  installed({ name: "unit and integration tests", executable: process.execPath, args: ["scripts/validation/test-suite.mjs", "unit"] }),
  installed({
    name: "Storybook mobile, tablet and desktop",
    executable: process.execPath,
    args: ["scripts/validation/test-suite.mjs", "storybook"],
  }),
  {
    name: "production build",
    executable: process.execPath,
    args: ["node_modules/next/dist/bin/next", "build"],
    needs: sourceChecks,
  },
  installed(script("Storybook build", "build-storybook")),
  {
    name: "Playwright E2E",
    executable: process.execPath,
    args: ["scripts/validation/runtime.mjs"],
    needs: ["production build", "Storybook build"],
  },
]
