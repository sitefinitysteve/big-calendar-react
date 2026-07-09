import * as React from "react"

import { cn } from "@/lib/utils"

export function NativeSelectOptGroup({ className, ref, ...props }: React.ComponentProps<"optgroup">) {
  return (
  <optgroup
    ref={ref}
    data-slot="native-select-optgroup"
    className={cn("bg-popover text-popover-foreground", className)}
    {...props}
  />
  )
}
NativeSelectOptGroup.displayName = "NativeSelectOptGroup"
