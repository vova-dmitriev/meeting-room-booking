import type { HTMLAttributes } from "react"
import type { Tone } from "@/shared/config"

export interface FeedbackProps extends HTMLAttributes<HTMLDivElement> {
  title: string
  description?: string
  tone?: Tone
}
