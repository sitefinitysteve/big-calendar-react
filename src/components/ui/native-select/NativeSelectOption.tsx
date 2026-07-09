import * as React from "react"

import { cn } from "@/lib/utils"

export function NativeSelectOption({ className, ref, ...props }: React.ComponentProps<"option">) {
  return (
  <option
    ref={ref}
    data-slot="native-select-option"
    className={cn("bg-popover text-popover-foreground", className)}
    {...props}
  />
  )
}
NativeSelectOption.displayName = "NativeSelectOption"
