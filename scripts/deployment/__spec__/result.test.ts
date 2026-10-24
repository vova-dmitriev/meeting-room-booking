import { describe, expect, it } from "vitest"
import { deploymentUrl } from "../result.mjs"
import { CliDeployment } from "./result.fixtures"

const ready = {
  status: "ok",
  deployment: { id: "dpl_ready", readyState: "READY", target: "production", url: "https://booking-unique.vercel.app" },
}

describe("published deployment output", () => {
  it("returns the immutable candidate origin rather than the existing production alias", () => {
    expect(deploymentUrl(CliDeployment.success)).toBe(CliDeployment.ordinary.url)
  })

  it.each([CliDeployment.ordinary, CliDeployment.verificationFailed, CliDeployment.checksFailed, CliDeployment.actionRequired])(
    "rejects ordinary mode or unsuccessful envelopes even when a ready deployment is present",
    (response) => expect(() => deploymentUrl(response)).toThrow(),
  )

  it("returns the public production origin only after a deployment is ready", () => {
    expect(deploymentUrl(ready)).toBe("https://booking-unique.vercel.app")
  })

  it.each([undefined, {}, { ...ready, status: "error" }, { ...ready, deployment: { ...ready.deployment, readyState: "BUILDING" } }])(
    "rejects incomplete or failed deployment results",
    (result) => expect(() => deploymentUrl(result)).toThrow(),
  )

  it.each([
    { ...ready.deployment, target: "preview" },
    { ...ready.deployment, url: undefined },
    { ...ready.deployment, url: "http://booking.vercel.app" },
    { ...ready.deployment, url: "https://other.example" },
    { ...ready.deployment, url: "https://booking.vercel.app/path" },
    { ...ready.deployment, url: "https://booking.vercel.app/?token=value" },
    { ...ready.deployment, url: "https://user:secret@booking.vercel.app" },
    { ...ready.deployment, url: "https://booking.vercel.app/\nOTHER=value" },
    { ...ready.deployment, id: undefined },
  ])("rejects preview, credential-bearing or unexpected URLs", (deployment) => {
    expect(() => deploymentUrl({ ...ready, deployment })).toThrow()
  })
})
