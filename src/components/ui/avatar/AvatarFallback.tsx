import * as React from "react"
import { Avatar as AvatarPrimitive } from "@base-ui/react/avatar"

import { cn } from "@/lib/utils"

export function AvatarFallback({ className, ref, ...props }: React.ComponentProps<typeof AvatarPrimitive.Fallback>) {
  return (
  <AvatarPrimitive.Fallback
    ref={ref}
    data-slot="avatar-fallback"
    className={cn("bg-muted flex size-full items-center justify-center rounded-full", className)}
    {...props}
  />
  )
}
AvatarFallback.displayName = "AvatarFallback"
