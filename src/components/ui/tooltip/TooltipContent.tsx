import * as React from "react"
import { Tooltip as TooltipPrimitive } from "@base-ui/react/tooltip"

import { cn } from "@/lib/utils"

export function TooltipContent({ className, sideOffset = 4, children, ref, ...props }: React.ComponentProps<typeof TooltipPrimitive.Popup> & { sideOffset?: number }) {
  return (
  <TooltipPrimitive.Portal>
    <TooltipPrimitive.Positioner sideOffset={sideOffset}>
      <TooltipPrimitive.Popup
        ref={ref}
        data-slot="tooltip-content"
        className={cn(
          "bg-foreground text-background animate-in fade-in-0 zoom-in-95 data-[closed]:animate-out data-[closed]:fade-out-0 data-[closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 z-50 w-fit rounded-md px-3 py-1.5 text-xs text-balance",
          className
        )}
        {...props}
      >
        {children}
        <TooltipPrimitive.Arrow className="bg-foreground fill-foreground z-50 size-2.5 translate-y-[calc(-50%_-_2px)] rotate-45 rounded-[2px]" />
      </TooltipPrimitive.Popup>
    </TooltipPrimitive.Positioner>
  </TooltipPrimitive.Portal>
  )
}
TooltipContent.displayName = "TooltipContent"
