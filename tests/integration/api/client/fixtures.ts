export const ClientFixture = {
  Origin: "http://http-client.test",
  Path: "/bookings",
  RelativeBase: "/api",
  ResolvedFallbackUrl: "http://localhost/api/bookings",
  Payload: { ready: true },
  MalformedBody: "{",
  TimeoutMs: 30,
  ValidationCode: "booking.validation.past",
  UnknownCode: "unrecognized.validation",
  Message: "Bad Request",
  Fallbacks: ["<html>Upstream unavailable</html>", "", "{", "null", "[]", '{"code":false}', '{"code":{"value":"past"}}'],
} as const
