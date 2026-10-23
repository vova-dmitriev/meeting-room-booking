import { ApiError } from "./api-error"

export const apiClient = {
  baseUrl: process.env.NEXT_PUBLIC_API_BASE_URL ?? "/api",

  async request<T>(path: string, options: RequestInit = {}): Promise<T> {
    if (!path.startsWith("/") || path.startsWith("//")) throw new ApiError(0, "API paths must start with one slash")

    const base = new URL(apiClient.baseUrl, globalThis.location?.origin)
    const target = new URL(`${apiClient.baseUrl}${path}`, base.origin)
    const allowedOrigins = [base.origin]
    const headers = new Headers(options.headers)

    headers.set("Accept", "application/json")

    if (options.body !== undefined) headers.set("Content-Type", "application/json")

    let response: Response

    try {
      if (allowedOrigins.includes(target.origin)) {
        response = await fetch(target, { ...options, headers })
      } else {
        throw new ApiError(0, "API request escaped its configured origin")
      }
    } catch (error) {
      if (options.signal?.aborted) throw error

      throw new ApiError(0, "Network request failed", { cause: error })
    }

    if (!response.ok) throw new ApiError(response.status, response.statusText)

    if (response.status === 204) return undefined as T

    return response.json() as Promise<T>
  },
}
