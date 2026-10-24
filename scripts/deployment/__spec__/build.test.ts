import { afterEach, describe, expect, it } from "vitest"
import { mkdtemp, mkdir, writeFile, readFile, rm } from "node:fs/promises"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { applicationBuild, prepareStaticOutput } from "../build.mjs"

const temporary: string[] = []

afterEach(async () => {
  await Promise.all(temporary.splice(0).map((path) => rm(path, { recursive: true, force: true })))
})

describe("release build reuse", () => {
  it("builds ordinary PRs without deployment credentials", () => {
    expect(applicationBuild({ GITHUB_EVENT_NAME: "pull_request" })).toEqual(["node", "node_modules/next/dist/bin/next", "build"])
  })

  it.each(["push", "workflow_dispatch"])("builds main on %s as standalone Vercel output for prebuilt publication", (event) => {
    const command = applicationBuild({
      GITHUB_EVENT_NAME: event,
      GITHUB_REF: "refs/heads/main",
      VERCEL_TOKEN: "fixture",
      VERCEL_APP_PROJECT_ID: "prj_app",
      VERCEL_TEAM_SLUG: "fixture-team",
    })

    expect(command).toContain("--standalone")
    expect(command).toContain("--prod")
    expect(command).toContain("build")
  })

  it.each(["push", "workflow_dispatch"])("refuses a main %s build without credentials", (event) => {
    expect(() => applicationBuild({ GITHUB_EVENT_NAME: event, GITHUB_REF: "refs/heads/main" })).toThrow(/configuration/)
  })

  it("packages existing static bytes as build output without invoking a build", async () => {
    const root = await mkdtemp(join(tmpdir(), "booking-static-output-"))

    temporary.push(root)
    const source = join(root, "tested-storybook")
    const target = join(root, "release")
    const bytes = Buffer.from("tested immutable bundle")

    await mkdir(join(source, "assets"), { recursive: true })
    await writeFile(join(source, "assets", "bundle.js"), bytes)
    await writeFile(join(source, "vercel.json"), "{}")
    await prepareStaticOutput(source, target)
    expect(await readFile(join(target, ".vercel/output/static/assets/bundle.js"))).toEqual(bytes)
    expect(JSON.parse(await readFile(join(target, ".vercel/output/config.json"), "utf8"))).toEqual({ version: 3 })
    await expect(readFile(join(target, ".vercel/output/static/vercel.json"))).rejects.toThrow()
  })
})
