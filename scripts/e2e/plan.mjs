import { appendFile } from "node:fs/promises"
import { createE2ePlan } from "./impact.mjs"

try {
  const selection = await createE2ePlan({ root: process.cwd(), base: process.env.E2E_BASE_SHA })
  const json = JSON.stringify(selection)

  if (process.env.GITHUB_OUTPUT) {
    await appendFile(process.env.GITHUB_OUTPUT, `selection=${json}\nmode=${selection.mode}\n`)
  } else {
    console.log(json)
  }
} catch {
  console.error("E2E planning failed; dependency impact could not be verified")
  process.exitCode = 1
}
