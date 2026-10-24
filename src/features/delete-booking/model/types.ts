export interface DeleteBookingProps {
  id: string
  date: string
  title?: string
  start?: string
  end?: string
  onDeleted?: (id: string) => void
}
