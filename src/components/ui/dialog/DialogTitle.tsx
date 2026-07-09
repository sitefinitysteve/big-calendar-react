import * as React from "react"
import { Dialog as DialogPrimitive } from "@base-ui/react/dialog"

import { cn } from "@/lib/utils"

export function DialogTitle({ className, ref, ...props }: React.ComponentProps<typeof DialogPrimitive.Title>) {
  return (
  <DialogPrimitive.Title
    ref={ref}
    data-slot="dialog-title"
    className={cn("text-lg leading-none font-semibold", className)}
    {...props}
  />
  )
}
DialogTitle.displayName = "DialogTitle"
