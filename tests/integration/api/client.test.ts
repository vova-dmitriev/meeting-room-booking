import { describe, expect, it } from "vitest"
import { apiClient } from "@/shared/api"

describe("HTTP client destination boundary", () => {
  it.each(["https://external.invalid/bookings", "//external.invalid/bookings", "bookings"])(
    "rejects non-rooted API path %s",
    async (path) => {
      await expect(apiClient.request(path)).rejects.toMatchObject({ message: "API paths must start with one slash" })
    },
  )
})
