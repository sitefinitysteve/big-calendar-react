import * as React from "react"
import { format } from "date-fns"
import type { Locale } from "date-fns"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

export interface SingleDayPickerProps {
  value?: Date
  onChange: (date?: Date) => void
  placeholder?: string
  labelVariant?: "P" | "PP" | "PPP"
  /**
   * date-fns locale for the trigger label and the popover's month/day names.
   * `labelVariant` is a localized-format token, so it resolves through the
   * locale's own `formatLong` — without one it silently renders US English.
   */
  locale?: Locale
  className?: string
  id?: string
}

export const SingleDayPicker: React.FC<SingleDayPickerProps> = ({
  value,
  onChange,
  placeholder = "Select a date",
  labelVariant = "PPP",
  locale,
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
              <span>
                {format(value, labelVariant, locale ? { locale } : undefined)}
              </span>
            ) : (
              <span className="text-muted-foreground">{placeholder}</span>
            )}
          </Button>
        }
      />

      <PopoverContent align="center" className="w-fit p-0">
        <Calendar
          mode="single"
          selected={value}
          onSelect={handleSelect}
          locale={locale}
          // The calendar grids are Sunday-first everywhere (the month view's
          // weekday header is a fixed Sun..Sat label list). Pinning the popover
          // to match keeps one product from showing two week starts at once.
          // Drop this line when week-start becomes locale-driven throughout.
          weekStartsOn={0}
        />
      </PopoverContent>
    </Popover>
  )
}
SingleDayPicker.displayName = "SingleDayPicker"
