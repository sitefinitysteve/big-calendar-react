import * as React from "react"
import { Dialog as DialogPrimitive } from "@base-ui/react/dialog"

import { cn } from "@/lib/utils"

export function DialogDescription({ className, ref, ...props }: React.ComponentProps<typeof DialogPrimitive.Description>) {
  return (
  <DialogPrimitive.Description
    ref={ref}
    data-slot="dialog-description"
    className={cn("text-muted-foreground text-sm", className)}
    {...props}
  />
  )
}
DialogDescription.displayName = "DialogDescription"
