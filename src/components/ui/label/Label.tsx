import * as React from "react"

import { cn } from "@/lib/utils"

// Base UI does not ship a Label primitive — a native <label> covers the same
// behavior. Kept as a component so consumers (and the Form primitives) can keep
// importing `Label`.
export function Label({ className, ref, ...props }: React.ComponentProps<"label">) {
  return (
  <label
    ref={ref}
    data-slot="label"
    className={cn(
      "flex items-center gap-2 text-sm leading-none font-medium select-none group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-50 peer-disabled:cursor-not-allowed peer-disabled:opacity-50",
      className
    )}
    {...props}
  />
  )
}
Label.displayName = "Label"
