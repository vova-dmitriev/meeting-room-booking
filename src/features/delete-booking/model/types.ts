export interface DeleteBookingProps {
  id: string
  date: string
  onDeleted?: (id: string) => void
}
