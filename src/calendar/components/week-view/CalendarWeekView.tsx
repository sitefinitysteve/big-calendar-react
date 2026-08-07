import {
  startOfWeek,
  addDays,
  format,
  parseISO,
  isSameDay,
  areIntervalsOverlapping,
  isSameWeek,
} from 'date-fns'
import { useCalendarStore } from '@/stores/calendar'
import { ScrollArea } from '@/components/ui/scroll-area'
import { cn } from '@/lib/utils'
import { groupEvents, getEventBlockStyle, isWorkingHour } from '@/calendar/helpers'
import { useVisibleHours } from '@/calendar/hooks/useVisibleHours'
import EventBlock from '@/calendar/components/week-view/EventBlock'
import CalendarTimeline from '@/calendar/components/week-view/CalendarTimeline'
import WeekViewMultiDayEventsRow from '@/calendar/components/week-view/WeekViewMultiDayEventsRow'
import type { IEvent } from '@/calendar/interfaces'
import { useCalendarLabels, useDateLocale } from '@/calendar/labels'
import { formatHour } from '@/calendar/date-format'
import { useCalendarCustomization } from '@/calendar/customization'

/** Literal (Tailwind-scannable) classes for the four 15-minute slots at 96px/hour. */
const STOCK_SLOT_CLASSES = [
  'absolute inset-x-0 top-0 h-[24px] cursor-pointer transition-colors hover:bg-accent',
  'absolute inset-x-0 top-[24px] h-[24px] cursor-pointer transition-colors hover:bg-accent',
  'absolute inset-x-0 top-[48px] h-[24px] cursor-pointer transition-colors hover:bg-accent',
  'absolute inset-x-0 top-[72px] h-[24px] cursor-pointer transition-colors hover:bg-accent',
]

interface CalendarWeekViewProps {
  singleDayEvents: IEvent[]
  multiDayEvents: IEvent[]
  canAdd?: boolean
  onOpenDetails?: (event: IEvent) => void
  onAddEvent?: (startDate?: Date, startTime?: { hour: number; minute: number }) => void
}

export default function CalendarWeekView({
  singleDayEvents,
  multiDayEvents,
  canAdd,
  onOpenDetails,
  onAddEvent,
}: CalendarWeekViewProps) {
  const labels = useCalendarLabels()
  const locale = useDateLocale()
  const { hourHeight, height, autoHeight, classNames } = useCalendarCustomization()
  // Stock 96px hour keeps its literal Tailwind classes so default output is
  // byte-identical; a custom hourHeight switches to inline positioning.
  const scaled = hourHeight !== 96
  const quarter = hourHeight / 4
  function slot(index: number) {
    if (!scaled) {
      return { className: STOCK_SLOT_CLASSES[index], style: undefined }
    }
    return {
      className: 'absolute inset-x-0 cursor-pointer transition-colors hover:bg-accent',
      style: { top: `${quarter * index}px`, height: `${quarter}px` },
    }
  }

  const visibleHours = useCalendarStore((s) => s.visibleHours)
  const workingHours = useCalendarStore((s) => s.workingHours)
  const selectedDate = useCalendarStore((s) => s.selectedDate)

  const { hours, earliestEventHour, latestEventHour } = useVisibleHours(
    visibleHours,
    singleDayEvents
  )

  const weekStart = startOfWeek(selectedDate)
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i))
  const showsToday = isSameWeek(selectedDate, new Date())

  function getDayEvents(day: Date): IEvent[] {
    return singleDayEvents.filter(
      (event) =>
        isSameDay(parseISO(event.startDate), day) ||
        isSameDay(parseISO(event.endDate), day)
    )
  }

  function getGroupedEvents(day: Date) {
    return groupEvents(getDayEvents(day))
  }

  function getEventStyle(
    event: IEvent,
    day: Date,
    groupIndex: number,
    groupSize: number,
    groupedEvents: IEvent[][]
  ) {
    const style = getEventBlockStyle(event, new Date(day), groupIndex, groupSize, {
      from: earliestEventHour,
      to: latestEventHour,
    })

    const hasOverlap = groupedEvents.some(
      (otherGroup, otherIndex) =>
        otherIndex !== groupIndex &&
        otherGroup.some((otherEvent) =>
          areIntervalsOverlapping(
            { start: parseISO(event.startDate), end: parseISO(event.endDate) },
            {
              start: parseISO(otherEvent.startDate),
              end: parseISO(otherEvent.endDate),
            }
          )
        )
    )

    if (!hasOverlap) {
      return { ...style, width: '100%', left: '0%' }
    }

    return style
  }

  function formatHourLabel(hour: number): string {
    return formatHour(new Date(new Date().setHours(hour, 0, 0, 0)), locale)
  }

  function handleTimeSlotClick(day: Date, hour: number, minute: number) {
    onAddEvent?.(day, { hour, minute })
  }

  return (
    <>
      {/* Mobile message */}
      <div className="flex flex-col items-center justify-center border-b py-4 text-sm text-muted-foreground sm:hidden">
        <p>{labels.weekViewNotAvailable}</p>
        <p>{labels.weekViewSwitchView}</p>
      </div>

      {/* Desktop week view */}
      <div className="hidden flex-col sm:flex">
        <div>
          {/* Week header. Sticky so the all-day strip below can scroll under it. */}
          <div className="sticky top-0 z-20 flex border-b bg-background">
            <div className="w-18" />
            <div className="grid flex-1 grid-cols-7 divide-x border-l">
              {weekDays.map((day, index) => (
                <span
                  key={index}
                  className="py-2 text-center text-xs font-medium text-muted-foreground"
                >
                  {format(day, 'EE', { locale })}
                  <span className="ml-1 font-semibold text-foreground">
                    {format(day, 'd')}
                  </span>
                </span>
              ))}
            </div>
          </div>

          <WeekViewMultiDayEventsRow
            selectedDate={selectedDate}
            multiDayEvents={multiDayEvents}
            onOpenDetails={onOpenDetails}
          />
        </div>

        <ScrollArea
          className={cn(height === undefined && !autoHeight && 'h-[736px]')}
          style={autoHeight ? undefined : height !== undefined ? { height } : undefined}
        >
          <div className="flex overflow-hidden">
            {/* Hours column */}
            <div className="relative w-18">
              {hours.map((hour, index) => (
                <div key={hour} className="relative" style={{ height: `${hourHeight}px` }}>
                  <div className="absolute -top-3 right-2 flex h-6 items-center">
                    {index !== 0 && (
                      <span className="text-xs text-muted-foreground">
                        {formatHourLabel(hour)}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Week grid */}
            <div className="relative flex-1 border-l">
              <div className="grid grid-cols-7 divide-x">
                {weekDays.map((day, dayIndex) => {
                  const groupedEvents = getGroupedEvents(day)

                  return (
                    <div key={dayIndex} className="relative">
                      {/* Hour rows */}
                      {hours.map((hour, hourIndex) => (
                        <div
                          key={hour}
                          className={cn(
                            'relative',
                            !isWorkingHour(day, hour, workingHours) &&
                              'bg-calendar-disabled-hour',
                            classNames?.hourRow
                          )}
                          style={{ height: `${hourHeight}px` }}
                        >
                          {hourIndex !== 0 && (
                            <div className="pointer-events-none absolute inset-x-0 top-0 border-b" />
                          )}

                          {/* 4 time slots per hour (15-minute intervals) */}
                          {canAdd !== false && (
                            <>
                              <div
                                {...slot(0)}
                                onClick={() => handleTimeSlotClick(day, hour, 0)}
                              />
                              <div
                                {...slot(1)}
                                onClick={() => handleTimeSlotClick(day, hour, 15)}
                              />
                            </>
                          )}

                          <div className="pointer-events-none absolute inset-x-0 top-1/2 border-b border-dashed" />

                          {canAdd !== false && (
                            <>
                              <div
                                {...slot(2)}
                                onClick={() => handleTimeSlotClick(day, hour, 30)}
                              />
                              <div
                                {...slot(3)}
                                onClick={() => handleTimeSlotClick(day, hour, 45)}
                              />
                            </>
                          )}
                        </div>
                      ))}

                      {/* Positioned event blocks */}
                      {groupedEvents.map((group, groupIndex) =>
                        group.map((event) => (
                          <div
                            key={event.id}
                            className="absolute p-1"
                            style={getEventStyle(
                              event,
                              day,
                              groupIndex,
                              groupedEvents.length,
                              groupedEvents
                            )}
                          >
                            <EventBlock event={event} onOpenDetails={onOpenDetails} />
                          </div>
                        ))
                      )}
                    </div>
                  )
                })}
              </div>

              {/* The "now" line is only meaningful on a week that contains today. */}
              {showsToday && (
                <CalendarTimeline
                  firstVisibleHour={earliestEventHour}
                  lastVisibleHour={latestEventHour}
                />
              )}
            </div>
          </div>
        </ScrollArea>
      </div>
    </>
  )
}
