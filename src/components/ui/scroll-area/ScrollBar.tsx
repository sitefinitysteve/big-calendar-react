import * as React from "react"
import { ScrollArea as ScrollAreaPrimitive } from "@base-ui/react/scroll-area"

import { cn } from "@/lib/utils"

export function ScrollBar({ className, orientation = "vertical", ref, ...props }: React.ComponentProps<typeof ScrollAreaPrimitive.Scrollbar>) {
  return (
  <ScrollAreaPrimitive.Scrollbar
    ref={ref}
    data-slot="scroll-area-scrollbar"
    orientation={orientation}
    className={cn(
      "flex touch-none p-px transition-colors select-none",
      orientation === "vertical" && "h-full w-2.5 border-l border-l-transparent",
      orientation === "horizontal" && "h-2.5 flex-col border-t border-t-transparent",
      className
    )}
    {...props}
  >
    <ScrollAreaPrimitive.Thumb
      data-slot="scroll-area-thumb"
      className="bg-border relative flex-1 rounded-full"
    />
  </ScrollAreaPrimitive.Scrollbar>
  )
}
ScrollBar.displayName = "ScrollBar"
