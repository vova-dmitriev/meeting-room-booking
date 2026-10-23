import { cn } from "@/shared/lib/cn"
import type { SurfaceProps } from "./surface.types"
import { SurfaceTestId } from "./test-ids"

export function Surface({ children, className, ...props }: SurfaceProps) {
  return (
    <div data-testid={SurfaceTestId.Root} className={cn("rounded-2xl border border-line bg-panel", className)} {...props}>
      {children}
    </div>
  )
}
