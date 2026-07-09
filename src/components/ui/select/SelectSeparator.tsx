import * as React from "react"
import { Select as SelectPrimitive } from "@base-ui/react/select"

import { cn } from "@/lib/utils"

export function SelectSeparator({ className, ref, ...props }: React.ComponentProps<typeof SelectPrimitive.Separator>) {
  return (
  <SelectPrimitive.Separator
    ref={ref}
    data-slot="select-separator"
    className={cn("bg-border pointer-events-none -mx-1 my-1 h-px", className)}
    {...props}
  />
  )
}
SelectSeparator.displayName = "SelectSeparator"
