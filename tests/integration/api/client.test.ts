import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from "vitest"
import { http, HttpResponse } from "msw"
import { setupServer } from "msw/node"
import { apiClient, ApiError, HttpStatus } from "@/shared/api"
import { ClientFixture } from "./client/fixtures"

const server = setupServer()
const originalBaseUrl = apiClient.baseUrl
const endpoint = `${ClientFixture.Origin}${ClientFixture.Path}`

beforeAll(() => {
  apiClient.baseUrl = ClientFixture.Origin
  server.listen({ onUnhandledRequest: "error" })
})

afterEach(() => {
  server.resetHandlers()
  vi.unstubAllGlobals()
})

afterAll(() => {
  apiClient.baseUrl = originalBaseUrl
  server.close()
})

describe("HTTP client destination boundary", () => {
  it.each(["https://external.invalid/bookings", "//external.invalid/bookings", "bookings"])(
    "rejects non-rooted API path %s",
    async (path) => {
      await expect(apiClient.request(path)).rejects.toMatchObject({ message: "API paths must start with one slash" })
    },
  )
})

describe("HTTP error envelopes", () => {
  it.each([ClientFixture.ValidationCode, ClientFixture.UnknownCode])("preserves a string response code: %s", async (code) => {
    server.use(http.get(endpoint, () => HttpResponse.json({ code }, { status: HttpStatus.BadRequest })))

    await expect(apiClient.request(ClientFixture.Path)).rejects.toMatchObject({ status: HttpStatus.BadRequest, code })
  })

  it.each(ClientFixture.Fallbacks)("keeps an HTTP error for a malformed or unusable envelope: %s", async (body) => {
    server.use(http.get(endpoint, () => new HttpResponse(body, { status: HttpStatus.BadRequest, statusText: ClientFixture.Message })))
    const failure = apiClient.request(ClientFixture.Path)

    await expect(failure).rejects.toBeInstanceOf(ApiError)
    await expect(failure).rejects.toMatchObject({ status: HttpStatus.BadRequest, message: ClientFixture.Message, code: undefined })
  })

  it("preserves cancellation while reading an error response", async () => {
    const controller = new AbortController()
    const aborted = new DOMException("The operation was aborted.", "AbortError")

    const body = new ReadableStream({
      pull(stream) {
        controller.abort()
        stream.error(aborted)
      },
    })

    vi.stubGlobal("fetch", async () => new Response(body, { status: HttpStatus.BadRequest, statusText: ClientFixture.Message }))

    await expect(apiClient.request(ClientFixture.Path, { signal: controller.signal })).rejects.toBe(aborted)
  })
})

describe("HTTP client robustness", () => {
  it("resolves a relative base against the fallback origin outside the browser", async () => {
    const requested: string[] = []
    const suiteBase = apiClient.baseUrl

    vi.stubGlobal("fetch", async (input: URL | RequestInfo) => {
      requested.push(String(input))

      return HttpResponse.json(ClientFixture.Payload)
    })

    apiClient.baseUrl = ClientFixture.RelativeBase

    try {
      await expect(apiClient.request<unknown>(ClientFixture.Path)).resolves.toEqual(ClientFixture.Payload)
    } finally {
      apiClient.baseUrl = suiteBase
    }

    expect(requested).toEqual([ClientFixture.ResolvedFallbackUrl])
  })

  it("wraps a malformed success body in ApiError", async () => {
    server.use(http.get(endpoint, () => new HttpResponse(ClientFixture.MalformedBody, { status: HttpStatus.Ok })))

    const failure = apiClient.request<unknown>(ClientFixture.Path)

    await expect(failure).rejects.toBeInstanceOf(ApiError)
    await expect(failure).rejects.toMatchObject({ status: HttpStatus.Ok, code: undefined })
  })

  it("aborts a stalled request through the timeout signal", async () => {
    vi.stubGlobal(
      "fetch",
      (_input: URL | RequestInfo, init?: RequestInit) =>
        new Promise<Response>((_, reject) => {
          init?.signal?.addEventListener("abort", () => reject(init.signal?.reason))
        }),
    )

    await expect(apiClient.request(ClientFixture.Path, { timeoutMs: ClientFixture.TimeoutMs })).rejects.toBeInstanceOf(ApiError)
  })
})
