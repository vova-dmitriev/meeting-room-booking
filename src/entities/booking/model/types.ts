export interface BookingInput {
  date: string
  start: string
  end: string
  title?: string
}

export interface Booking extends BookingInput {
  id: string
  host?: string
  people?: number
}

export interface ValidationContext {
  bookings: Booking[]
  now: Date
  excludeId?: string
}
