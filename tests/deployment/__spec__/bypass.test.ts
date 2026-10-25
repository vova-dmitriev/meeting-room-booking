import { afterEach, describe, expect, it } from "vitest"
import { protectionBypassState } from "../bypass"

const BypassFixture = {
  AppSecret: "app-bypass-secret",
  StorybookSecret: "storybook-bypass-secret",
  AppUrl: "https://meeting-room-booking-abc123-team.vercel.app/",
  StorybookUrl: "https://meeting-room-booking-storybook-abc123-team.vercel.app/",
} as const

const OriginalEnvironment = { ...process.env }

afterEach(() => {
  process.env = { ...OriginalEnvironment }
})

describe("Vercel protection bypass state", () => {
  it("builds one bypass cookie per candidate origin", () => {
    process.env.DEPLOYMENT_URL = BypassFixture.AppUrl
    process.env.VERCEL_APP_BYPASS_SECRET = BypassFixture.AppSecret
    process.env.STORYBOOK_DEPLOYMENT_URL = BypassFixture.StorybookUrl
    process.env.VERCEL_STORYBOOK_BYPASS_SECRET = BypassFixture.StorybookSecret

    const state = protectionBypassState()

    expect(state?.cookies).toHaveLength(2)
    expect(state?.cookies[0]).toMatchObject({ domain: "meeting-room-booking-abc123-team.vercel.app", value: BypassFixture.AppSecret })

    expect(state?.cookies[1]).toMatchObject({
      domain: "meeting-room-booking-storybook-abc123-team.vercel.app",
      value: BypassFixture.StorybookSecret,
    })
  })

  it("skips a surface when its url or secret is missing", () => {
    process.env.DEPLOYMENT_URL = BypassFixture.AppUrl
    process.env.VERCEL_APP_BYPASS_SECRET = BypassFixture.AppSecret

    const state = protectionBypassState()

    expect(state?.cookies).toHaveLength(1)
  })

  it("stays undefined outside release verification", () => {
    expect(protectionBypassState()).toBeUndefined()
  })

  it("rejects a non-https candidate url", () => {
    process.env.DEPLOYMENT_URL = "http://127.0.0.1:3100"
    process.env.VERCEL_APP_BYPASS_SECRET = BypassFixture.AppSecret

    expect(protectionBypassState()).toBeUndefined()
  })
})
