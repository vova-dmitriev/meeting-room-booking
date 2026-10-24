import { describe, expect, it } from "vitest"
import { deploymentUrl } from "../result.mjs"
import { readFileSync } from "node:fs"
import { CliDeployment } from "./result.fixtures"

const ready = {
  status: "ok",
  deployment: { readyState: "READY", target: "production", productionUrl: "https://booking.vercel.app" },
}

describe("published deployment output", () => {
  it("pins the CLI JSON envelope explicitly for both deployment commands", () => {
    const workflow = readFileSync(new URL("../../../.github/workflows/quality.yml", import.meta.url), "utf8")

    const commands = workflow
      .replace(/\\\r?\n\s*/g, " ")
      .split("\n")
      .filter((line) => line.includes("vercel@65.2.0 deploy"))

    expect(commands).toHaveLength(2)

    for (const command of commands) {
      expect(command).toMatch(/(?:^|\s)--non-interactive(?:\s|$)/)
      expect(command).toMatch(/(?:^|\s)--json(?:\s|$)/)
    }

    expect(deploymentUrl(CliDeployment.success)).toBe(CliDeployment.ordinary.productionUrl)
  })

  it.each([CliDeployment.ordinary, CliDeployment.verificationFailed, CliDeployment.checksFailed, CliDeployment.actionRequired])(
    "rejects ordinary mode or unsuccessful envelopes even when a ready deployment is present",
    (response) => expect(() => deploymentUrl(response)).toThrow(),
  )

  it("returns the public production origin only after a deployment is ready", () => {
    expect(deploymentUrl(ready)).toBe("https://booking.vercel.app")
  })

  it.each([undefined, {}, { ...ready, status: "error" }, { ...ready, deployment: { ...ready.deployment, readyState: "BUILDING" } }])(
    "rejects incomplete or failed deployment results",
    (result) => expect(() => deploymentUrl(result)).toThrow(),
  )

  it.each([
    { ...ready.deployment, target: "preview" },
    { ...ready.deployment, productionUrl: undefined },
    { ...ready.deployment, productionUrl: "http://booking.vercel.app" },
    { ...ready.deployment, productionUrl: "https://other.example" },
    { ...ready.deployment, productionUrl: "https://booking.vercel.app/path" },
    { ...ready.deployment, productionUrl: "https://booking.vercel.app/?token=value" },
    { ...ready.deployment, productionUrl: "https://user:secret@booking.vercel.app" },
    { ...ready.deployment, productionUrl: "https://booking.vercel.app/\nOTHER=value" },
  ])("rejects preview, credential-bearing or unexpected URLs", (deployment) => {
    expect(() => deploymentUrl({ ...ready, deployment })).toThrow()
  })
})
