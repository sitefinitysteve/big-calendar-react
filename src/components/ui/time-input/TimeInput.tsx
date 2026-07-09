import * as React from "react"

import { cn } from "@/lib/utils"

export interface TimeValue {
  hour: number
  minute: number
}

export interface TimeInputProps {
  value?: TimeValue
  onChange: (value: TimeValue) => void
  hourCycle?: 12 | 24
  className?: string
  "data-invalid"?: boolean
}

export const TimeInput: React.FC<TimeInputProps> = ({
  value,
  onChange,
  hourCycle = 12,
  className,
  ...rest
}) => {
  const hours = React.useMemo(() => {
    if (hourCycle === 24) {
      return Array.from({ length: 24 }, (_, i) => ({
        value: i,
        label: String(i).padStart(2, "0"),
      }))
    }
    return Array.from({ length: 12 }, (_, i) => ({
      value: i === 0 ? 12 : i,
      label: String(i === 0 ? 12 : i).padStart(2, "0"),
    }))
  }, [hourCycle])

  const minutes = React.useMemo(
    () =>
      Array.from({ length: 60 }, (_, i) => ({
        value: i,
        label: String(i).padStart(2, "0"),
      })),
    []
  )

  const displayHour = (() => {
    if (!value) return ""
    if (hourCycle === 24) return String(value.hour).padStart(2, "0")
    const h = value.hour % 12
    return String(h === 0 ? 12 : h).padStart(2, "0")
  })()

  const displayMinute = value ? String(value.minute).padStart(2, "0") : ""

  const period = !value || hourCycle === 24 ? "AM" : value.hour >= 12 ? "PM" : "AM"

  function handleHourChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const v = parseInt(e.target.value)
    let hour24 = v
    if (hourCycle === 12) {
      if (period === "PM" && v !== 12) hour24 = v + 12
      else if (period === "AM" && v === 12) hour24 = 0
      else hour24 = v
    }
    onChange({ hour: hour24, minute: value?.minute ?? 0 })
  }

  function handleMinuteChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const v = parseInt(e.target.value)
    onChange({ hour: value?.hour ?? 0, minute: v })
  }

  function handlePeriodChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const newPeriod = e.target.value
    if (!value) return
    let hour = value.hour
    if (newPeriod === "PM" && hour < 12) hour += 12
    else if (newPeriod === "AM" && hour >= 12) hour -= 12
    onChange({ hour, minute: value.minute })
  }

  return (
    <div
      className={cn(
        "inline-flex h-9 w-full items-center overflow-hidden whitespace-nowrap rounded-md border bg-background px-3 py-2 text-sm",
        "focus-within:outline-none focus-within:ring-1 focus-within:ring-ring",
        className
      )}
      {...rest}
    >
      <select
        value={displayHour}
        className="appearance-none bg-transparent p-0.5 text-center outline-none focus:bg-foreground/10 focus:rounded"
        onChange={handleHourChange}
      >
        {!value && (
          <option value="" disabled>
            --
          </option>
        )}
        {hours.map((h) => (
          <option key={h.value} value={h.label}>
            {h.label}
          </option>
        ))}
      </select>
      <span className="text-muted-foreground">:</span>
      <select
        value={displayMinute}
        className="appearance-none bg-transparent p-0.5 text-center outline-none focus:bg-foreground/10 focus:rounded"
        onChange={handleMinuteChange}
      >
        {!value && (
          <option value="" disabled>
            --
          </option>
        )}
        {minutes.map((m) => (
          <option key={m.value} value={m.label}>
            {m.label}
          </option>
        ))}
      </select>
      {hourCycle === 12 && (
        <select
          value={period}
          className="ml-1 appearance-none bg-transparent p-0.5 text-center outline-none focus:bg-foreground/10 focus:rounded"
          onChange={handlePeriodChange}
        >
          <option value="AM">AM</option>
          <option value="PM">PM</option>
        </select>
      )}
    </div>
  )
}
TimeInput.displayName = "TimeInput"
