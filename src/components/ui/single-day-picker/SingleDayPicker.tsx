import * as React from "react"
import { format } from "date-fns"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

export interface SingleDayPickerProps {
  value?: Date
  onChange: (date?: Date) => void
  placeholder?: string
  labelVariant?: "P" | "PP" | "PPP"
  className?: string
  id?: string
}

export const SingleDayPicker: React.FC<SingleDayPickerProps> = ({
  value,
  onChange,
  placeholder = "Select a date",
  labelVariant = "PPP",
  className,
  id,
}) => {
  const [open, setOpen] = React.useState(false)

  function handleSelect(date?: Date) {
    onChange(date)
    setOpen(false)
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        render={
          <Button
            id={id}
            variant="outline"
            className={cn(
              "group relative h-9 w-full justify-start whitespace-nowrap px-3 py-2 font-normal hover:bg-inherit",
              className
            )}
          >
            {value ? (
              <span>{format(value, labelVariant)}</span>
            ) : (
              <span className="text-muted-foreground">{placeholder}</span>
            )}
          </Button>
        }
      />

      <PopoverContent align="center" className="w-fit p-0">
        <Calendar mode="single" selected={value} onSelect={handleSelect} />
      </PopoverContent>
    </Popover>
  )
}
SingleDayPicker.displayName = "SingleDayPicker"
