import { appendFile } from "node:fs/promises"
import { createE2ePlan } from "./impact.mjs"

try {
  const selection = await createE2ePlan({ root: process.cwd(), base: process.env.E2E_BASE_SHA })
  const json = JSON.stringify(selection)

  console.log(json)

  if (process.env.GITHUB_OUTPUT) {
    await appendFile(process.env.GITHUB_OUTPUT, `selection=${json}\nmode=${selection.mode}\n`)
  }

  if (process.env.GITHUB_STEP_SUMMARY) {
    const files = selection.files.map((file) => `- ${file}`).join("\n")
    const list = files ? `\n${files}` : ""

    await appendFile(process.env.GITHUB_STEP_SUMMARY, `**E2E selection:** \`${selection.mode}\` ${selection.reason}${list}\n`)
  }
} catch {
  console.error("E2E planning failed; dependency impact could not be verified")
  process.exitCode = 1
}
