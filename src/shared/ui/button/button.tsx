import { LoaderCircle } from "lucide-react"
import { ButtonVariant } from "@/shared/config"
import { cn } from "@/shared/lib/cn"
import { Button as ShadcnButton } from "@/shared/ui/primitives"
import type { ButtonProps } from "./button.types"
import { ButtonTestId } from "./test-ids"

const variants = { primary: "default", secondary: "outline", ghost: "ghost", danger: "destructive" } as const

export function Button({
  variant = ButtonVariant.Primary,
  loading,
  icon,
  children,
  className,
  disabled,
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <ShadcnButton
      data-testid={ButtonTestId.Root}
      type={type}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      variant={variants[variant]}
      className={cn("min-h-11 min-w-11 rounded-xl px-4 py-2.5 font-semibold", className)}
      {...props}
    >
      {loading ? <LoaderCircle size={16} className="animate-spin" aria-hidden /> : icon}
      {children}
    </ShadcnButton>
  )
}
