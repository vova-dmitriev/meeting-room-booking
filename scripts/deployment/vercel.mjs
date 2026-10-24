import { spawn } from "node:child_process"
import { deploymentUrl } from "./result.mjs"

export function runCommand(executable, args, options = {}) {
  return new Promise((accept, reject) => {
    const child = spawn(executable, args, { ...options, stdio: options.capture ? ["ignore", "pipe", "inherit"] : "inherit" })
    let stdout = ""

    child.stdout?.on("data", (data) => {
      stdout += data
    })

    child.on("error", () => reject(new Error("Release command could not start")))

    child.on("close", (code) => {
      if (code === 0) accept(stdout)
      else reject(new Error(`Release command failed (exit ${code ?? "signal"})`))
    })
  })
}

export function createVercel({ token, scope, projects, paths }, run = runCommand, request = fetch) {
  if (!token || !scope || !projects.application || !projects.storybook) throw new Error("Missing Vercel release configuration")
  const auth = ["--non-interactive", "--scope", scope, "--token", token]
  const cli = (args, options = {}) => run("npx", ["--yes", "vercel@65.2.0", ...args, ...auth], options)

  return {
    previous: async (surface) => {
      const url = new URL(`https://api.vercel.com/v9/projects/${encodeURIComponent(projects[surface])}`)

      url.searchParams.set("slug", scope)
      const response = await request(url, { headers: { Authorization: `Bearer ${token}` }, signal: AbortSignal.timeout(30_000) })

      if (!response.ok) throw new Error(`Cannot read previous ${surface} deployment (HTTP ${response.status})`)
      const previous = (await response.json()).targets?.production
      const alias = previous?.alias?.find((value) => /^[\w.-]+\.vercel\.app$/.test(value))

      if (typeof previous?.id !== "string" || !/^dpl_[\w-]+$/.test(previous.id) || !alias) {
        throw new Error(`No recoverable production deployment for ${surface}`)
      }

      return { id: previous.id, productionUrl: `https://${alias}` }
    },
    publish: async (surface) => {
      const result = JSON.parse(
        await cli(["deploy", "--prebuilt", "--prod", "--skip-domain", "--yes", "--json", "--project", projects[surface]], {
          cwd: paths[surface],
          capture: true,
        }),
      )

      return { ...result.deployment, url: deploymentUrl(result) }
    },
    promote: (surface, id) => cli(["promote", id, "--yes"], { cwd: paths[surface] }),
    rollback: (surface, id) => cli(["rollback", id, "--yes"], { cwd: paths[surface] }),
  }
}
