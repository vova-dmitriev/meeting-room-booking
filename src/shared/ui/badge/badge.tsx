import { Badge as ShadcnBadge } from "@/shared/ui/primitives"
import { cn } from "@/shared/lib/cn"
import { Tone } from "@/shared/config"
import type { BadgeProps } from "./badge.types"
import { BadgeTestId } from "./test-ids"

const tones = {
  neutral: "bg-subtle text-muted",
  success: "bg-soft text-accent",
  warning: "bg-warning-soft text-warning",
  danger: "bg-danger-soft text-danger",
}

export function Badge({ tone = Tone.Neutral, dot, children, className, ...props }: BadgeProps) {
  return (
    <ShadcnBadge
      data-testid={BadgeTestId.Root}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium whitespace-nowrap",
        tones[tone],
        className,
      )}
      {...props}
    >
      {dot ? <span className="size-1.5 rounded-full bg-current" aria-hidden /> : null}
      {children}
    </ShadcnBadge>
  )
}
