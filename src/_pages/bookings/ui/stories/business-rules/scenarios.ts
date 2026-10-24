export const RuleInterval = {
  StartBeforeWorkday: { start: "08:59", end: "09:30" },
  StartAfterWorkday: { start: "18:01", end: "18:31" },
  EndBeforeWorkday: { start: "08:00", end: "08:30" },
  EndAfterWorkday: { start: "17:30", end: "18:01" },
  Equal: { start: "10:00", end: "10:00" },
  Reversed: { start: "11:00", end: "10:00" },
  BelowMinimum: { start: "10:00", end: "10:29" },
  AboveMaximum: { start: "10:00", end: "12:01" },
  Minimum: { start: "09:00", end: "09:30" },
  Maximum: { start: "16:00", end: "18:00" },
  OffStep: { start: "10:05", end: "10:35" },
  Overlap: { start: "09:40", end: "10:10" },
  TouchAfter: { start: "10:00", end: "10:30" },
} as const

export const RuleDate = { Past: "2026-10-22", PastTime: "2026-10-23T12:30:00+03:00" } as const

export const RuleServerFailure = { Delay: 350, Code: "UNAVAILABLE" } as const
