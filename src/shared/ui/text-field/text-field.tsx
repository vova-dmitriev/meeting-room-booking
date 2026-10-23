import { Input } from "@/shared/ui/primitives"
import { cn } from "@/shared/lib/cn"
import type { TextFieldProps } from "./text-field.types"
import { TextFieldTestId } from "./test-ids"

export function TextField({ label, error, hint, id, className, ...props }: TextFieldProps) {
  const description = error || hint

  return (
    <div data-testid={TextFieldTestId.Root} className={cn("flex flex-col gap-2", className)}>
      <label htmlFor={id} className="text-xs font-semibold text-ink">
        {label}
      </label>
      <Input
        id={id}
        data-testid={TextFieldTestId.Input}
        aria-invalid={Boolean(error) || undefined}
        aria-describedby={description ? `${id}-description` : undefined}
        className={cn(
          cn(
            "h-11 min-w-0 w-full rounded-xl border bg-panel px-3.5 text-sm text-ink",
            "placeholder:text-muted focus:border-accent focus:outline-accent disabled:bg-subtle",
            "disabled:text-muted",
          ),
          error ? "border-danger" : "border-control-border",
        )}
        {...props}
      />
      {description ? (
        <span id={`${id}-description`} className={cn("text-xs", error ? "text-danger" : "text-muted")}>
          {description}
        </span>
      ) : null}
    </div>
  )
}
