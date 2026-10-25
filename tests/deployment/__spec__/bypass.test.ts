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
  OkStatus: 200,
  SsoHost: "vercel.com",
  SsoUrl: "https://vercel.com/sso-api?url=blocked",
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
  it("completes the documented handshake once per protected candidate origin", async () => {
    process.env.DEPLOYMENT_URL = BypassFixture.AppUrl
    process.env.VERCEL_APP_BYPASS_SECRET = BypassFixture.AppSecret
    process.env.STORYBOOK_DEPLOYMENT_URL = BypassFixture.StorybookUrl
    process.env.VERCEL_STORYBOOK_BYPASS_SECRET = BypassFixture.StorybookSecret

    apiContext.get.mockResolvedValue({
      status: () => BypassFixture.OkStatus,
      ok: () => true,
      url: () => BypassFixture.AppUrl,
    })

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

  it("runs without a bypass when a production alias is public", async () => {
    process.env.DEPLOYMENT_URL = BypassFixture.AppUrl
    process.env.VERCEL_APP_BYPASS_SECRET = BypassFixture.AppSecret

    apiContext.get.mockResolvedValue({
      status: () => BypassFixture.OkStatus,
      ok: () => true,
      url: () => BypassFixture.AppUrl,
    })

    apiContext.storageState.mockResolvedValue({ cookies: [] })

    const state = await protectionBypassState()

    expect(state?.cookies).toHaveLength(0)
    expect(apiContext.dispose).toHaveBeenCalled()
  })

  it("fails loudly when a challenge redirects away unanswered", async () => {
    process.env.DEPLOYMENT_URL = BypassFixture.AppUrl
    process.env.VERCEL_APP_BYPASS_SECRET = BypassFixture.AppSecret

    apiContext.get.mockResolvedValue({
      status: () => BypassFixture.OkStatus,
      ok: () => true,
      url: () => BypassFixture.SsoUrl,
    })

    apiContext.storageState.mockResolvedValue({ cookies: [issuedCookie(BypassFixture.SsoHost)] })

    await expect(protectionBypassState()).rejects.toThrow("did not admit the bypass")
    expect(apiContext.dispose).toHaveBeenCalled()
  })

  it("fails loudly when protection rejects the secret", async () => {
    process.env.DEPLOYMENT_URL = BypassFixture.AppUrl
    process.env.VERCEL_APP_BYPASS_SECRET = BypassFixture.AppSecret

    apiContext.get.mockResolvedValue({
      status: () => BypassFixture.ForbiddenStatus,
      ok: () => false,
      url: () => BypassFixture.AppUrl,
    })

    apiContext.storageState.mockResolvedValue({ cookies: [] })

    await expect(protectionBypassState()).rejects.toThrow("did not admit the bypass")
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
