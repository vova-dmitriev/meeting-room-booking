import type { ButtonHTMLAttributes, ReactNode } from "react"
import type { ButtonVariant } from "@/shared/config"

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  loading?: boolean
  icon?: ReactNode
}
