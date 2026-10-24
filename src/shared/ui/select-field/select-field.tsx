import { ChevronDown } from "lucide-react"
import { cn } from "@/shared/lib/cn"
import type { SelectFieldProps } from "./select-field.types"
import { SelectFieldTestId } from "./test-ids"

export function SelectField({ label, options, id, ...props }: SelectFieldProps) {
  return (
    <div data-testid={SelectFieldTestId.Root} className="flex flex-col gap-2">
      <label htmlFor={id} className="text-xs font-semibold">
        {label}
      </label>
      <div className="relative">
        <select
          id={id}
          data-testid={SelectFieldTestId.Select}
          className={cn(
            "h-11 min-w-0 w-full appearance-none rounded-xl border border-control-border bg-panel pr-11 pl-3",
            "text-sm text-ink",
          )}
          {...props}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <ChevronDown
          data-testid={SelectFieldTestId.Chevron}
          size={16}
          aria-hidden
          className="pointer-events-none absolute top-1/2 right-3.75 -translate-y-1/2 text-muted"
        />
      </div>
    </div>
  )
}
