import * as React from "react"
import { Popover as PopoverPrimitive } from "@base-ui/react/popover"

import { cn } from "@/lib/utils"

type PositionerProps = React.ComponentPropsWithoutRef<typeof PopoverPrimitive.Positioner>

export interface PopoverContentProps
  extends React.ComponentProps<typeof PopoverPrimitive.Popup> {
  align?: PositionerProps["align"]
  side?: PositionerProps["side"]
  sideOffset?: PositionerProps["sideOffset"]
}

export function PopoverContent({ className, align = "center", sideOffset = 4, side, ref, ...props }: PopoverContentProps) {
  return (
  <PopoverPrimitive.Portal>
    <PopoverPrimitive.Positioner align={align} side={side} sideOffset={sideOffset}>
      <PopoverPrimitive.Popup
        ref={ref}
        data-slot="popover-content"
        className={cn(
          "bg-popover text-popover-foreground data-[open]:animate-in data-[closed]:animate-out data-[closed]:fade-out-0 data-[open]:fade-in-0 data-[closed]:zoom-out-95 data-[open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 z-50 w-72 rounded-md border p-4 shadow-md origin-(--transform-origin) outline-hidden",
          className
        )}
        {...props}
      />
    </PopoverPrimitive.Positioner>
  </PopoverPrimitive.Portal>
  )
}
PopoverContent.displayName = "PopoverContent"
