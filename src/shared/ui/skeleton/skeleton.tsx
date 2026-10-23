import { Skeleton as ShadcnSkeleton } from "@/shared/ui/primitives"
import { cn } from "@/shared/lib/cn"
import type { SkeletonProps } from "./skeleton.types"
import { SkeletonTestId } from "./test-ids"

export function Skeleton({ className, ...props }: SkeletonProps) {
  return (
    <ShadcnSkeleton
      data-testid={SkeletonTestId.Root}
      aria-hidden
      className={cn("animate-pulse rounded-xl bg-subtle", className)}
      {...props}
    />
  )
}
