import { readdirSync, readFileSync } from "node:fs"
import { join } from "node:path"

const issues = []
const layers = new Set(["_app", "_pages", "widgets", "features", "entities", "shared"])

const generated = new Set([
  "node_modules",
  ".next",
  "storybook-static",
  ".git",
  ".codegraph",
  ".superpowers",
  "public",
  "playwright-report",
  "test-results",
])

function visit(directory) {
  const entries = readdirSync(directory, { withFileTypes: true })

  const authored = entries.filter(
    (entry) => entry.isFile() && /\.(ts|tsx|mjs|css)$/.test(entry.name) && entry.name !== "index.ts" && !entry.name.endsWith(".d.ts"),
  )

  if (directory.startsWith("src/") && authored.length > 6) issues.push(`${directory}: more than 6 non-index files`)

  for (const entry of entries) {
    const path = join(directory, entry.name)

    if (entry.isDirectory()) {
      if (generated.has(entry.name)) continue
      if (directory === "src" && !layers.has(entry.name)) issues.push(`${path}: unsupported FSD layer`)
      visit(path)
    } else if (/\.(ts|tsx|mjs|css)$/.test(entry.name) && !entry.name.endsWith(".d.ts")) {
      const source = readFileSync(path, "utf8")
      const lines = source.trimEnd().split("\n").length

      if (lines > 200) issues.push(`${path}: ${lines} lines exceeds 200`)
      if (
        path.startsWith("src/") &&
        path !== "src/_app/styles/tokens.css" &&
        /#[a-f\d]{3,8}\b|(?:rgb|hsl|oklch)\(\s*[\d.]|(?:bg|text|border)-(?:slate|gray|green|red|blue|white|black)(?:-\d+)?\b/i.test(source)
      )
        issues.push(`${path}: literal color outside tokens`)
      if (path.startsWith("src/") && path.endsWith(".css") && !["src/_app/styles/tokens.css", "src/_app/styles/globals.css"].includes(path))
        issues.push(`${path}: stylesheet outside allowlist`)
    }
  }
}

visit(".")
if (issues.length) {
  console.error(issues.join("\n"))
  process.exitCode = 1
} else console.log("Structure clean: FSD layers, file caps, theme tokens and stylesheet allowlist")
