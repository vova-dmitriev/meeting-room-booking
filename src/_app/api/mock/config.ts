export const MockLatency = { Read: 250, Write: 350, Sending: 4000, Delete: 200 } as const

export const MockBooking = { ConcurrentId: "concurrent", DefaultPeople: 2 } as const

export const MockStorage = { BookingsKey: "meeting-room-bookings", Version: 1 } as const

export const MockErrorCode = {
  NotFound: "NOT_FOUND",
  Conflict: "CONFLICT",
  Unavailable: "UNAVAILABLE",
  InvalidInput: "INVALID_INPUT",
} as const
