export const LiveApiClock = {
  origin: "http://live-booking-api.test",
  initial: "2026-10-24T12:00:00+03:00",
  later: "2026-10-24T12:20:00+03:00",
  input: { date: "2026-10-24", start: "12:10", end: "12:40", title: "Проверка времени комнаты" },
  past: { date: "2026-10-24", start: "11:30", end: "12:00", title: "Прошедший интервал" },
} as const
