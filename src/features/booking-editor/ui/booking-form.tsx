"use client"

import type { BookingFormProps } from "../model/types"
import { EditorProvider } from "./editor-provider/editor-provider"
import { BookingFormContent } from "./form-content/booking-form-content"

export function BookingForm(props: BookingFormProps) {
  return (
    <EditorProvider options={props}>
      <BookingFormContent {...props} />
    </EditorProvider>
  )
}
