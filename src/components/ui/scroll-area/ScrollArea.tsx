import * as React from "react"
import { ScrollArea as ScrollAreaPrimitive } from "@base-ui/react/scroll-area"

import { cn } from "@/lib/utils"
import { ScrollBar } from "./ScrollBar"

export function ScrollArea({ className, children, ref, ...props }: React.ComponentProps<typeof ScrollAreaPrimitive.Root>) {
  return (
  <ScrollAreaPrimitive.Root
    ref={ref}
    data-slot="scroll-area"
    className={cn("relative", className)}
    {...props}
  >
    <ScrollAreaPrimitive.Viewport
      data-slot="scroll-area-viewport"
      className="focus-visible:ring-ring/50 size-full rounded-[inherit] transition-[color,box-shadow] outline-none focus-visible:ring-[3px] focus-visible:outline-1"
    >
      {children}
    </ScrollAreaPrimitive.Viewport>
    <ScrollBar />
    <ScrollAreaPrimitive.Corner />
  </ScrollAreaPrimitive.Root>
  )
}
ScrollArea.displayName = "ScrollArea"
