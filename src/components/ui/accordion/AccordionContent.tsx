import * as React from "react"
import { Accordion as AccordionPrimitive } from "@base-ui/react/accordion"

import { cn } from "@/lib/utils"

export function AccordionContent({ className, children, ref, ...props }: React.ComponentProps<typeof AccordionPrimitive.Panel>) {
  return (
  <AccordionPrimitive.Panel
    ref={ref}
    data-slot="accordion-content"
    className="data-[closed]:animate-accordion-up data-[open]:animate-accordion-down overflow-hidden text-sm"
    {...props}
  >
    <div className={cn("pt-0 pb-4", className)}>{children}</div>
  </AccordionPrimitive.Panel>
  )
}
AccordionContent.displayName = "AccordionContent"
