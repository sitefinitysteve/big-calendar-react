import * as React from "react"
import { Select as SelectPrimitive } from "@base-ui/react/select"
import { ChevronDown } from "lucide-react"

import { cn } from "@/lib/utils"

export function SelectScrollDownButton({ className, ref, ...props }: React.ComponentProps<typeof SelectPrimitive.ScrollDownArrow>) {
  return (
  <SelectPrimitive.ScrollDownArrow
    ref={ref}
    data-slot="select-scroll-down-button"
    className={cn("flex cursor-default items-center justify-center py-1", className)}
    {...props}
  >
    <ChevronDown className="size-4" />
  </SelectPrimitive.ScrollDownArrow>
  )
}
SelectScrollDownButton.displayName = "SelectScrollDownButton"
