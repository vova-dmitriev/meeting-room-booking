import { cn } from "@/shared/lib/cn"
import { PrimitiveTestId } from "../test-ids"

function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-testid={PrimitiveTestId.Skeleton}
      data-slot="skeleton"
      className={cn("animate-pulse rounded-md bg-accent", className)}
      {...props}
    />
  )
}

export { Skeleton }
