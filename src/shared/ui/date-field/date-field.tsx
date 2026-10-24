"use client"

import { TextField } from "@/shared/ui/text-field"
import type { DateFieldProps } from "./date-field.types"

export function DateField(props: DateFieldProps) {
  return (
    <TextField
      {...props}
      type="date"
      onClick={(event) => {
        try {
          event.currentTarget.showPicker?.()
        } catch {
          event.currentTarget.focus()
        }

        props.onClick?.(event)
      }}
    />
  )
}
