import * as React from "react"

import { cn } from "@/lib/utils"

export interface AvatarGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  max?: number
  count?: number
  spacing?: number
  ref?: React.Ref<HTMLDivElement>
}

export function AvatarGroup({ className, max = 1, count = 0, spacing = 10, style, children, ref, ...props }: AvatarGroupProps) {
    const overflow = count > max ? count - max : 0
    return (
      <div
        ref={ref}
        className={cn(
          "relative flex [&>*:not(:first-child)]:-ml-[var(--avatar-group-spacing)] [&>*]:border-2 [&>*]:border-background",
          className
        )}
        style={{ ["--avatar-group-spacing" as string]: `${spacing}px`, ...style }}
        {...props}
      >
        {children}
        {overflow > 0 && (
          <div className="relative flex size-6 items-center justify-center rounded-full border-2 border-background bg-muted text-xxs">
            +{overflow}
          </div>
        )}
      </div>
    )
}
AvatarGroup.displayName = "AvatarGroup"
