import { cp, mkdir, writeFile } from "node:fs/promises"
import { basename, join, resolve } from "node:path"
import { fileURLToPath } from "node:url"
import { runCommand } from "./vercel.mjs"

export function applicationBuild(env) {
  if (!["push", "workflow_dispatch"].includes(env.GITHUB_EVENT_NAME) || env.GITHUB_REF !== "refs/heads/main") {
    return ["node", "node_modules/next/dist/bin/next", "build"]
  }

  if (!env.VERCEL_TOKEN || !env.VERCEL_APP_PROJECT_ID || !env.VERCEL_TEAM_SLUG) {
    throw new Error("Production build requires complete Vercel configuration")
  }

  return [
    "npx",
    "--yes",
    "vercel@65.2.0",
    "build",
    "--prod",
    "--standalone",
    "--yes",
    "--non-interactive",
    "--project",
    env.VERCEL_APP_PROJECT_ID,
    "--scope",
    env.VERCEL_TEAM_SLUG,
    "--token",
    env.VERCEL_TOKEN,
  ]
}

export async function prepareStaticOutput(source, target) {
  const output = join(target, ".vercel/output")

  await mkdir(output, { recursive: true })
  await cp(source, join(output, "static"), { recursive: true, filter: (path) => basename(path) !== "vercel.json" })
  await writeFile(join(output, "config.json"), JSON.stringify({ version: 3 }))
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    const [executable, ...args] = applicationBuild(process.env)

    await runCommand(executable, args)
  } catch {
    console.error("Application artifact build failed; inspect the preceding build output")
    process.exitCode = 1
  }
}
