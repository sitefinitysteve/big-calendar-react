import * as React from "react"
import { Dialog as DialogPrimitive } from "@base-ui/react/dialog"
import { X } from "lucide-react"

import { cn } from "@/lib/utils"
import { DialogOverlay } from "./DialogOverlay"

export interface DialogContentProps
  extends React.ComponentProps<typeof DialogPrimitive.Popup> {
  showCloseButton?: boolean
}

export function DialogContent({ className, children, showCloseButton = true, ref, ...props }: DialogContentProps) {
  return (
  <DialogPrimitive.Portal>
    <DialogOverlay />
    <DialogPrimitive.Popup
      ref={ref}
      data-slot="dialog-content"
      className={cn(
        "bg-background data-[open]:animate-in data-[closed]:animate-out data-[closed]:fade-out-0 data-[open]:fade-in-0 data-[closed]:zoom-out-95 data-[open]:zoom-in-95 fixed top-[50%] left-[50%] z-50 grid w-full max-w-[calc(100%-2rem)] translate-x-[-50%] translate-y-[-50%] gap-4 rounded-lg border p-6 shadow-lg duration-200 sm:max-w-lg",
        className
      )}
      {...props}
    >
      {children}
      {showCloseButton && (
        <DialogPrimitive.Close
          data-slot="dialog-close"
          className="ring-offset-background focus:ring-ring absolute top-4 right-4 rounded-xs opacity-70 transition-opacity hover:opacity-100 focus:ring-2 focus:ring-offset-2 focus:outline-hidden disabled:pointer-events-none [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4"
        >
          <X />
          <span className="sr-only">Close</span>
        </DialogPrimitive.Close>
      )}
    </DialogPrimitive.Popup>
  </DialogPrimitive.Portal>
  )
}
DialogContent.displayName = "DialogContent"
