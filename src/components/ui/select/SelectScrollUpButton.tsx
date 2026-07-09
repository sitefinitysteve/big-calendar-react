import * as React from "react"
import { Select as SelectPrimitive } from "@base-ui/react/select"
import { ChevronUp } from "lucide-react"

import { cn } from "@/lib/utils"

export function SelectScrollUpButton({ className, ref, ...props }: React.ComponentProps<typeof SelectPrimitive.ScrollUpArrow>) {
  return (
  <SelectPrimitive.ScrollUpArrow
    ref={ref}
    data-slot="select-scroll-up-button"
    className={cn("flex cursor-default items-center justify-center py-1", className)}
    {...props}
  >
    <ChevronUp className="size-4" />
  </SelectPrimitive.ScrollUpArrow>
  )
}
SelectScrollUpButton.displayName = "SelectScrollUpButton"
