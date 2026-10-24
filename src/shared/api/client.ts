import { ApiError } from "./api-error"
import { HttpStatus } from "./http-status"
import { ClientDefaults } from "./client-values"

export const apiClient = {
  baseUrl: process.env.NEXT_PUBLIC_API_BASE_URL ?? "/api",

  async request<T>(path: string, options: RequestInit & { timeoutMs?: number } = {}): Promise<T> {
    if (!path.startsWith("/") || path.startsWith("//")) throw new ApiError(0, "API paths must start with one slash")

    const base = new URL(apiClient.baseUrl, globalThis.location?.origin ?? ClientDefaults.FallbackOrigin)
    const target = new URL(`${apiClient.baseUrl}${path}`, base.origin)
    const allowedOrigins = [base.origin]
    const headers = new Headers(options.headers)

    headers.set("Accept", "application/json")

    if (options.body !== undefined) headers.set("Content-Type", "application/json")

    const { timeoutMs, ...requestInit } = options
    const timeoutSignal = AbortSignal.timeout(timeoutMs ?? ClientDefaults.RequestTimeoutMs)
    const signal = options.signal ? AbortSignal.any([options.signal, timeoutSignal]) : timeoutSignal
    let response: Response

    try {
      if (allowedOrigins.includes(target.origin)) {
        response = await fetch(target, { ...requestInit, signal, headers })
      } else {
        throw new ApiError(0, "API request escaped its configured origin")
      }
    } catch (error) {
      if (options.signal?.aborted) throw error

      throw new ApiError(0, "Network request failed", { cause: error })
    }

    if (!response.ok) {
      let code: string | undefined

      try {
        const body: unknown = await response.json()

        if (body && typeof body === "object" && "code" in body && typeof body.code === "string") code = body.code
      } catch (error) {
        if (options.signal?.aborted) throw error
      }

      throw new ApiError(response.status, response.statusText, { code })
    }

    if (response.status === HttpStatus.NoContent) return undefined as T

    try {
      return (await response.json()) as T
    } catch (error) {
      if (options.signal?.aborted) throw error

      throw new ApiError(response.status, "Response body was not valid JSON", { cause: error })
    }
  },
}
