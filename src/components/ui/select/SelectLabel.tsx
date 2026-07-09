import * as React from "react"
import { Select as SelectPrimitive } from "@base-ui/react/select"

import { cn } from "@/lib/utils"

export function SelectLabel({ className, ref, ...props }: React.ComponentProps<typeof SelectPrimitive.GroupLabel>) {
  return (
  <SelectPrimitive.GroupLabel
    ref={ref}
    data-slot="select-label"
    className={cn("text-muted-foreground px-2 py-1.5 text-xs", className)}
    {...props}
  />
  )
}
SelectLabel.displayName = "SelectLabel"
