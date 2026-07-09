import * as React from "react"
import { Accordion as AccordionPrimitive } from "@base-ui/react/accordion"

import { cn } from "@/lib/utils"

export function AccordionItem({ className, ref, ...props }: React.ComponentProps<typeof AccordionPrimitive.Item>) {
  return (
  <AccordionPrimitive.Item
    ref={ref}
    data-slot="accordion-item"
    className={cn("border-b last:border-b-0", className)}
    {...props}
  />
  )
}
AccordionItem.displayName = "AccordionItem"
