import * as React from "react"
import { Select as SelectPrimitive } from "@base-ui/react/select"

import { cn } from "@/lib/utils"
import { SelectScrollUpButton } from "./SelectScrollUpButton"
import { SelectScrollDownButton } from "./SelectScrollDownButton"

type PositionerProps = React.ComponentPropsWithoutRef<typeof SelectPrimitive.Positioner>

export interface SelectContentProps
  extends React.ComponentProps<typeof SelectPrimitive.Popup> {
  align?: PositionerProps["align"]
  side?: PositionerProps["side"]
  sideOffset?: PositionerProps["sideOffset"]
}

export function SelectContent({ className, children, align = "start", side, sideOffset = 4, ref, ...props }: SelectContentProps) {
  return (
  <SelectPrimitive.Portal>
    <SelectPrimitive.Positioner
      className="z-50"
      align={align}
      side={side}
      sideOffset={sideOffset}
      alignItemWithTrigger={false}
    >
      <SelectPrimitive.Popup
        ref={ref}
        data-slot="select-content"
        className={cn(
          "bg-popover text-popover-foreground data-[open]:animate-in data-[closed]:animate-out data-[closed]:fade-out-0 data-[open]:fade-in-0 data-[closed]:zoom-out-95 data-[open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 relative z-50 max-h-[var(--available-height)] min-w-[var(--anchor-width)] overflow-x-hidden overflow-y-auto rounded-md border p-1 shadow-md",
          className
        )}
        {...props}
      >
        <SelectScrollUpButton />
        {children}
        <SelectScrollDownButton />
      </SelectPrimitive.Popup>
    </SelectPrimitive.Positioner>
  </SelectPrimitive.Portal>
  )
}
SelectContent.displayName = "SelectContent"
