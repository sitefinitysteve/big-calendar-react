import * as React from "react"
import { Avatar as AvatarPrimitive } from "@base-ui/react/avatar"

import { cn } from "@/lib/utils"

export function AvatarImage({ className, ref, ...props }: React.ComponentProps<typeof AvatarPrimitive.Image>) {
  return (
  <AvatarPrimitive.Image
    ref={ref}
    data-slot="avatar-image"
    className={cn("aspect-square size-full", className)}
    {...props}
  />
  )
}
AvatarImage.displayName = "AvatarImage"
