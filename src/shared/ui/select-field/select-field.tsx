import type { SelectFieldProps } from "./select-field.types"
import { SelectFieldTestId } from "./test-ids"

export function SelectField({ label, options, id, ...props }: SelectFieldProps) {
  return (
    <div data-testid={SelectFieldTestId.Root} className="flex flex-col gap-2">
      <label htmlFor={id} className="text-xs font-semibold">
        {label}
      </label>
      <select
        id={id}
        data-testid={SelectFieldTestId.Select}
        className="h-11 min-w-0 w-full rounded-xl border border-control-border bg-panel px-3 text-sm text-ink"
        {...props}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  )
}
