import { DemoDate } from "@/entities/booking"

const input = { date: DemoDate, start: "10:00", end: "11:00", title: "Планирование релиза" }

export const MalformedApi = {
  origin: "http://malformed-booking-api.test",
  input,
  errorCode: "INVALID_INPUT",
  cases: [
    { name: "null", body: "null" },
    { name: "malformed JSON", body: "{" },
    { name: "array", body: "[]" },
    { name: "string", body: JSON.stringify(input.title) },
    { name: "missing date", body: JSON.stringify({ start: input.start, end: input.end }) },
    { name: "date object", body: JSON.stringify({ ...input, date: {} }) },
    { name: "start number", body: JSON.stringify({ ...input, start: 600 }) },
    { name: "end null", body: JSON.stringify({ ...input, end: null }) },
    { name: "title object", body: JSON.stringify({ ...input, title: { text: input.title } }) },
    { name: "title null", body: JSON.stringify({ ...input, title: null }) },
  ],
} as const
