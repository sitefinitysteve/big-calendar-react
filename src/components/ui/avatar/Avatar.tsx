import * as React from "react"
import { Avatar as AvatarPrimitive } from "@base-ui/react/avatar"

import { cn } from "@/lib/utils"

export function Avatar({ className, ref, ...props }: React.ComponentProps<typeof AvatarPrimitive.Root>) {
  return (
  <AvatarPrimitive.Root
    ref={ref}
    data-slot="avatar"
    className={cn("relative flex size-8 shrink-0 overflow-hidden rounded-full", className)}
    {...props}
  />
  )
}
Avatar.displayName = "Avatar"
