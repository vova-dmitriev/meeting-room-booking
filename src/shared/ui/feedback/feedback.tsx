import { CircleAlert, CircleCheck, Info } from "lucide-react"
import { cn } from "@/shared/lib/cn"
import { Tone } from "@/shared/config"
import type { FeedbackProps } from "./feedback.types"
import { FeedbackTestId } from "./test-ids"

const tones = {
  neutral: "bg-subtle text-muted",
  success: "bg-soft text-accent",
  warning: "bg-warning-soft text-warning",
  danger: "bg-danger-soft text-danger",
}

export function Feedback({ title, description, tone = Tone.Neutral, className, ...props }: FeedbackProps) {
  const Icon = tone === Tone.Success ? CircleCheck : tone === Tone.Danger ? CircleAlert : Info

  return (
    <div
      data-testid={FeedbackTestId.Root}
      role={tone === Tone.Danger ? "alert" : "status"}
      className={cn("flex gap-3 rounded-xl p-4 text-sm", tones[tone], className)}
      {...props}
    >
      <Icon size={18} className="mt-0.5 shrink-0" aria-hidden />
      <div>
        <p className="font-semibold">{title}</p>
        {description ? <p className="mt-1 text-xs/relaxed">{description}</p> : null}
      </div>
    </div>
  )
}
