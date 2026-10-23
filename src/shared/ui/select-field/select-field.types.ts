import type { SelectHTMLAttributes } from "react"

export interface SelectFieldProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label: string
  options: ReadonlyArray<{ value: string; label: string }>
}
