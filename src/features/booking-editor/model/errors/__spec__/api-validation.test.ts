import { describe, expect, it } from "vitest"
import { BookingApiError, BookingError } from "@/entities/booking"
import { HttpStatus } from "@/shared/api"
import { getBookingValidationError } from "../api-validation"

const ValidationFailure = {
  Message: "Bad Request",
  UnknownCode: "unrecognized.validation",
  MalformedCodes: [null, false, {}, []],
} as const

describe("booking API validation feedback", () => {
  it.each(Object.values(BookingError))("accepts the known domain code %s", (code) => {
    const failure = new BookingApiError(HttpStatus.BadRequest, ValidationFailure.Message, { code })

    expect(getBookingValidationError(failure)).toBe(code)
  })

  it("rejects unknown error codes", () => {
    const failure = new BookingApiError(HttpStatus.BadRequest, ValidationFailure.Message, { code: ValidationFailure.UnknownCode })

    expect(getBookingValidationError(failure)).toBeNull()
  })

  it("rejects non-API failures containing a known code", () => {
    expect(getBookingValidationError({ code: BookingError.Past })).toBeNull()
  })

  it("ignores an API failure without a code", () => {
    expect(getBookingValidationError(new BookingApiError(HttpStatus.Unavailable, ValidationFailure.Message))).toBeNull()
  })

  it.each(ValidationFailure.MalformedCodes)("rejects malformed runtime codes: %s", (code) => {
    const failure = Object.assign(new BookingApiError(HttpStatus.BadRequest, ValidationFailure.Message), { code })

    expect(getBookingValidationError(failure)).toBeNull()
  })
})
