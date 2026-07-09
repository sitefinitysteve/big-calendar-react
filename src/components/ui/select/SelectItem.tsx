import * as React from "react"
import { Select as SelectPrimitive } from "@base-ui/react/select"
import { Check } from "lucide-react"

import { cn } from "@/lib/utils"

export function SelectItem({ className, children, ref, ...props }: React.ComponentProps<typeof SelectPrimitive.Item>) {
  return (
  <SelectPrimitive.Item
    ref={ref}
    data-slot="select-item"
    className={cn(
      "data-[highlighted]:bg-accent data-[highlighted]:text-accent-foreground [&_svg:not([class*='text-'])]:text-muted-foreground relative flex w-full cursor-default items-center gap-2 rounded-sm py-1.5 pr-8 pl-2 text-sm outline-hidden select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 *:[span]:last:flex *:[span]:last:items-center *:[span]:last:gap-2",
      className
    )}
    {...props}
  >
    <span className="absolute right-2 flex size-3.5 items-center justify-center">
      <SelectPrimitive.ItemIndicator>
        <Check className="size-4" />
      </SelectPrimitive.ItemIndicator>
    </span>
    <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
  </SelectPrimitive.Item>
  )
}
SelectItem.displayName = "SelectItem"
