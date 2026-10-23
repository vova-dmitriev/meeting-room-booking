import type { ReactNode } from "react"
import type { Booking } from "@/entities/booking/model/types"

export interface BookingCardProps {
  booking: Booking
  onEdit: (booking: Booking) => void
  actions?: ReactNode
}
