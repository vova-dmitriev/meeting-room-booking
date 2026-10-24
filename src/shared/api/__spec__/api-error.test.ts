import { describe, expect, it } from "vitest"
import { ApiError } from "../api-error"

const Failure = {
  Conflict: { status: 409, message: "Conflict" },
  Validation: { status: 400, message: "Bad Request" },
  NotFound: { status: 404, message: "Not Found" },
  Unavailable: { status: 503, message: "Service Unavailable" },
  Network: { status: 0, message: "Network request failed" },
} as const

describe("API error classification", () => {
  it("identifies conflicts without exposing HTTP checks to consumers", () => {
    const error = new ApiError(Failure.Conflict.status, Failure.Conflict.message)

    expect(error.isConflict).toBe(true)
  })

  it.each([Failure.Validation, Failure.NotFound, Failure.Unavailable, Failure.Network])(
    "keeps other failures distinct: $status",
    ({ status, message }) => {
      expect(new ApiError(status, message).isConflict).toBe(false)
    },
  )
})
