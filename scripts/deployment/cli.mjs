import { mkdir, readFile, rename, writeFile } from "node:fs/promises"
import { join } from "node:path"
import { release, restoreRelease } from "./release.mjs"
import { createVercel, runCommand } from "./vercel.mjs"
import { prepareStaticOutput } from "./build.mjs"

const directory = join(process.cwd(), ".superpowers/release")
const stateFile = join(directory, "state.json")
const paths = { application: process.cwd(), storybook: join(directory, "storybook") }

async function persist(state) {
  await writeFile(`${stateFile}.tmp`, JSON.stringify(state))
  await rename(`${stateFile}.tmp`, stateFile)
}

async function verify(candidates, stage) {
  const key = stage === "candidates" ? "url" : "productionUrl"

  const env = {
    ...process.env,
    DEPLOYMENT_URL: candidates.application[key],
    STORYBOOK_DEPLOYMENT_URL: candidates.storybook[key],
    APPLICATION_TEST_URL: candidates.application[key],
    PLAYWRIGHT_HTML_OUTPUT_DIR: `playwright-report/${stage}`,
  }

  if (!env.DEPLOYMENT_URL || !env.STORYBOOK_DEPLOYMENT_URL) throw new Error("Release verification URLs are required")
  console.log(`Verifying ${stage} before completing the release`)
  await runCommand("npm", ["run", "test:deployment", "--", "--workers=1", "--forbid-only", "--reporter=github,html"], { env })

  if (stage === "candidates") {
    env.PLAYWRIGHT_HTML_OUTPUT_DIR = "playwright-report/affected-candidates"
    await runCommand(process.execPath, ["scripts/e2e/staging.mjs"], { env })
  }
}

try {
  const platform = createVercel({
    token: process.env.VERCEL_TOKEN,
    scope: process.env.VERCEL_TEAM_SLUG,
    projects: { application: process.env.VERCEL_APP_PROJECT_ID, storybook: process.env.VERCEL_STORYBOOK_PROJECT_ID },
    paths,
  })

  await mkdir(directory, { recursive: true })

  if (process.argv[2] === "rollback") {
    const content = await readFile(stateFile, "utf8").catch((error) => {
      if (error.code === "ENOENT") return null
      throw error
    })

    if (content) await restoreRelease(JSON.parse(content), { platform, persist })
  } else if (process.argv[2] === "release") {
    await prepareStaticOutput("storybook-static", paths.storybook)
    const candidates = await release({ platform, verify, persist })

    console.log(`Application: ${candidates.application.productionUrl}\nStorybook: ${candidates.storybook.productionUrl}`)
  } else {
    throw new Error("Expected release or rollback")
  }
} catch (error) {
  console.error(error.message)
  process.exitCode = 1
}
