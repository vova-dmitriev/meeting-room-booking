import type { HTMLAttributes } from "react"
import type { Tone } from "@/shared/config"

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: Tone
  dot?: boolean
}
