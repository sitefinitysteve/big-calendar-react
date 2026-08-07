import { useMemo } from 'react'
import {
  parseISO,
  startOfDay,
  startOfWeek,
  endOfWeek,
  addDays,
  differenceInDays,
  isBefore,
  isAfter,
} from 'date-fns'
import { cn } from '@/lib/utils'
import MonthEventBadge from '@/calendar/components/month-view/MonthEventBadge'
import type { IEvent } from '@/calendar/interfaces'
import { useCalendarLabels } from '@/calendar/labels'
import { useCalendarCustomization } from '@/calendar/customization'

/** One badge row: `h-6.5` (26px) plus the `gap-1` (4px) that follows it. */
const ALL_DAY_ROW_HEIGHT = 26
const ALL_DAY_ROW_GAP = 4
/** The strip's own `py-1`. */
const ALL_DAY_ROW_PADDING = 8

interface WeekViewMultiDayEventsRowProps {
  selectedDate: Date
  multiDayEvents: IEvent[]
  onOpenDetails?: (event: IEvent) => void
}

interface ProcessedEvent extends IEvent {
  adjustedStart: Date
  adjustedEnd: Date
  startIndex: number
  endIndex: number
}

export default function WeekViewMultiDayEventsRow({
  selectedDate,
  multiDayEvents,
  onOpenDetails,
}: WeekViewMultiDayEventsRowProps) {
  const labels = useCalendarLabels()
  const { allDayMaxRows } = useCalendarCustomization()
  const weekStart = useMemo(() => startOfWeek(selectedDate), [selectedDate])
  const weekEnd = useMemo(() => endOfWeek(selectedDate), [selectedDate])
  const weekDays = useMemo(
    () => Array.from({ length: 7 }, (_, i) => addDays(weekStart, i)),
    [weekStart]
  )

  const processedEvents = useMemo<ProcessedEvent[]>(() => {
    return multiDayEvents
      .map((event) => {
        const start = parseISO(event.startDate)
        const end = parseISO(event.endDate)
        const adjustedStart = isBefore(start, weekStart) ? weekStart : start
        const adjustedEnd = isAfter(end, weekEnd) ? weekEnd : end
        const startIndex = differenceInDays(adjustedStart, weekStart)
        const endIndex = differenceInDays(adjustedEnd, weekStart)

        return {
          ...event,
          adjustedStart,
          adjustedEnd,
          startIndex,
          endIndex,
        }
      })
      .sort((a, b) => {
        const startDiff = a.adjustedStart.getTime() - b.adjustedStart.getTime()
        if (startDiff !== 0) return startDiff
        return b.endIndex - b.startIndex - (a.endIndex - a.startIndex)
      })
  }, [multiDayEvents, weekStart, weekEnd])

  const eventRows = useMemo(() => {
    const rows: ProcessedEvent[][] = []

    processedEvents.forEach((event) => {
      let rowIndex = rows.findIndex((row) =>
        row.every((e) => e.endIndex < event.startIndex || e.startIndex > event.endIndex)
      )

      if (rowIndex === -1) {
        rowIndex = rows.length
        rows.push([])
      }

      rows[rowIndex]!.push(event)
    })

    return rows
  }, [processedEvents])

  const hasEventsInWeek = useMemo(() => {
    return multiDayEvents.some((event) => {
      const start = parseISO(event.startDate)
      const end = parseISO(event.endDate)

      return (
        (start >= weekStart && start <= weekEnd) ||
        (end >= weekStart && end <= weekEnd) ||
        (start <= weekStart && end >= weekEnd)
      )
    })
  }, [multiDayEvents, weekStart, weekEnd])

  function getPosition(
    dayIndex: number,
    event: ProcessedEvent
  ): 'first' | 'middle' | 'last' | 'none' {
    if (dayIndex === event.startIndex && dayIndex === event.endIndex) return 'none'
    if (dayIndex === event.startIndex) return 'first'
    if (dayIndex === event.endIndex) return 'last'
    return 'middle'
  }

  // When capped, the strip scrolls internally instead of pushing the grid down.
  const capped = allDayMaxRows !== undefined && eventRows.length > allDayMaxRows
  const maxHeight = capped
    ? allDayMaxRows! * ALL_DAY_ROW_HEIGHT +
      (allDayMaxRows! - 1) * ALL_DAY_ROW_GAP +
      ALL_DAY_ROW_PADDING
    : undefined

  if (!hasEventsInWeek) return null

  return (
    <div className="hidden sm:flex">
      <div className="flex w-18 shrink-0 items-start justify-end border-b py-1 pr-2 text-xs text-muted-foreground">
        {labels.allDay}
      </div>
      <div
        data-all-day-strip=""
        className={cn(
          'grid flex-1 grid-cols-7 divide-x border-b border-l',
          capped && 'overflow-y-auto'
        )}
        style={maxHeight === undefined ? undefined : { maxHeight: `${maxHeight}px` }}
      >
        {weekDays.map((day, dayIndex) => (
          <div key={day.toISOString()} className="flex h-full flex-col gap-1 py-1">
            {eventRows.map((row, rowIndex) => {
              const event = row.find(
                (e) => e.startIndex <= dayIndex && e.endIndex >= dayIndex
              )

              return event ? (
                <MonthEventBadge
                  key={`${rowIndex}-${dayIndex}`}
                  event={event}
                  cellDate={startOfDay(day)}
                  position={getPosition(dayIndex, event)}
                  onOpenDetails={onOpenDetails}
                />
              ) : (
                <div key={`${rowIndex}-${dayIndex}`} className="h-6.5" />
              )
            })}
          </div>
        ))}
      </div>
    </div>
  )
}
