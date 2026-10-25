import type { Cookie } from "@playwright/test"
import { afterEach, describe, expect, it, vi } from "vitest"
import { protectionBypassState } from "../bypass"

const apiContext = { get: vi.fn(), storageState: vi.fn(), dispose: vi.fn() }

vi.mock("@playwright/test", () => ({ request: { newContext: async () => apiContext } }))

const BypassFixture = {
  AppSecret: "app-bypass-secret",
  StorybookSecret: "storybook-bypass-secret",
  AppUrl: "https://meeting-room-booking-abc123-team.vercel.app/",
  AppHost: "meeting-room-booking-abc123-team.vercel.app",
  StorybookUrl: "https://meeting-room-booking-storybook-abc123-team.vercel.app/",
  StorybookHost: "meeting-room-booking-storybook-abc123-team.vercel.app",
  IssuedCookieValue: "vercel-issued-bypass-cookie",
  ForbiddenStatus: 403,
} as const

const OriginalEnvironment = { ...process.env }

function issuedCookie(host: string): Cookie {
  return {
    name: "vercel-issued-cookie",
    value: BypassFixture.IssuedCookieValue,
    domain: host,
    path: "/",
    expires: -1,
    httpOnly: true,
    secure: true,
    sameSite: "Lax",
  }
}

afterEach(() => {
  process.env = { ...OriginalEnvironment }

  vi.resetAllMocks()
})

describe("Vercel protection bypass state", () => {
  it("completes the documented handshake once per candidate origin", async () => {
    process.env.DEPLOYMENT_URL = BypassFixture.AppUrl
    process.env.VERCEL_APP_BYPASS_SECRET = BypassFixture.AppSecret
    process.env.STORYBOOK_DEPLOYMENT_URL = BypassFixture.StorybookUrl
    process.env.VERCEL_STORYBOOK_BYPASS_SECRET = BypassFixture.StorybookSecret

    apiContext.get.mockResolvedValue({ status: () => 200 })

    apiContext.storageState.mockResolvedValue({
      cookies: [issuedCookie(BypassFixture.AppHost), issuedCookie(BypassFixture.StorybookHost)],
    })

    const state = await protectionBypassState()

    const handshakes = new Map(apiContext.get.mock.calls.map(([url, options]) => [new URL(String(url)).hostname, options.headers]))

    expect(handshakes.get(BypassFixture.AppHost)).toMatchObject({
      "x-vercel-protection-bypass": BypassFixture.AppSecret,
      "x-vercel-set-bypass-cookie": "true",
    })

    expect(handshakes.get(BypassFixture.StorybookHost)).toMatchObject({
      "x-vercel-protection-bypass": BypassFixture.StorybookSecret,
      "x-vercel-set-bypass-cookie": "true",
    })

    expect(state?.cookies).toHaveLength(2)

    expect(state?.cookies.map((cookie) => cookie.domain)).toEqual(
      expect.arrayContaining([BypassFixture.AppHost, BypassFixture.StorybookHost]),
    )

    expect(apiContext.dispose).toHaveBeenCalled()
  })

  it("fails loudly when no bypass cookie is issued", async () => {
    process.env.DEPLOYMENT_URL = BypassFixture.AppUrl
    process.env.VERCEL_APP_BYPASS_SECRET = BypassFixture.AppSecret

    apiContext.get.mockResolvedValue({ status: () => BypassFixture.ForbiddenStatus })
    apiContext.storageState.mockResolvedValue({ cookies: [] })

    await expect(protectionBypassState()).rejects.toThrow("did not issue a bypass cookie")
    expect(apiContext.dispose).toHaveBeenCalled()
  })

  it("stays undefined outside release verification", async () => {
    expect(await protectionBypassState()).toBeUndefined()

    expect(apiContext.get).not.toHaveBeenCalled()
  })

  it("rejects a non-https candidate url", async () => {
    process.env.DEPLOYMENT_URL = "http://127.0.0.1:3100"
    process.env.VERCEL_APP_BYPASS_SECRET = BypassFixture.AppSecret

    expect(await protectionBypassState()).toBeUndefined()

    expect(apiContext.get).not.toHaveBeenCalled()
  })
})
