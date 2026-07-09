import * as React from "react"
import { Dialog as DialogPrimitive } from "@base-ui/react/dialog"

import { cn } from "@/lib/utils"

export function DialogOverlay({ className, ref, ...props }: React.ComponentProps<typeof DialogPrimitive.Backdrop>) {
  return (
  <DialogPrimitive.Backdrop
    ref={ref}
    data-slot="dialog-overlay"
    className={cn(
      "data-[open]:animate-in data-[closed]:animate-out data-[closed]:fade-out-0 data-[open]:fade-in-0 fixed inset-0 z-50 bg-black/80",
      className
    )}
    {...props}
  />
  )
}
DialogOverlay.displayName = "DialogOverlay"
