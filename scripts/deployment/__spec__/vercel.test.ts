import { describe, expect, it } from "vitest"
import { createVercel } from "../vercel.mjs"
import { CliDeployment } from "./result.fixtures"

const config = {
  token: "fixture",
  scope: "fixture-team",
  projects: { application: "prj_app", storybook: "prj_storybook" },
  paths: { application: "/fixture/application", storybook: "/fixture/storybook" },
}

describe("Vercel release boundary", () => {
  it("captures the previous deployment and its actual assigned production alias", async () => {
    const request = async () =>
      new Response(
        JSON.stringify({
          targets: {
            production: {
              id: "dpl_previous",
              alias: ["booking-tan.vercel.app"],
            },
          },
        }),
      )

    const platform = createVercel(config, async () => "", request)

    expect(await platform.previous("application")).toEqual({ id: "dpl_previous", productionUrl: "https://booking-tan.vercel.app" })
  })

  it.each([{}, { targets: {} }, { targets: { production: { id: "dpl_previous", alias: [] } } }])(
    "refuses to publish without a recoverable production target: %j",
    async (body) => {
      const platform = createVercel(
        config,
        async () => "",
        async () => new Response(JSON.stringify(body)),
      )

      await expect(platform.previous("application")).rejects.toThrow()
    },
  )

  it("publishes only prebuilt candidates without changing production aliases", async () => {
    const commands: string[][] = []

    const platform = createVercel(config, async (_executable: string, args: string[]) => {
      commands.push(args)

      return JSON.stringify({ ...CliDeployment.success, deployment: { ...CliDeployment.ordinary, productionUrl: null } })
    })

    expect((await platform.publish("application")).url).toBe(CliDeployment.ordinary.url)
    expect(commands[0]).toEqual(expect.arrayContaining(["--prebuilt", "--skip-domain", "--prod", "--json", "--non-interactive"]))
  })
})
