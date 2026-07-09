import {
  startOfWeek,
  addDays,
  format,
  parseISO,
  isSameDay,
  areIntervalsOverlapping,
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

  const visibleHours = useCalendarStore((s) => s.visibleHours)
  const workingHours = useCalendarStore((s) => s.workingHours)
  const selectedDate = useCalendarStore((s) => s.selectedDate)

  const { hours, earliestEventHour, latestEventHour } = useVisibleHours(
    visibleHours,
    singleDayEvents
  )

  const weekStart = startOfWeek(selectedDate)
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i))

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
    return format(new Date(new Date().setHours(hour, 0, 0, 0)), 'hh a')
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
          <WeekViewMultiDayEventsRow
            selectedDate={selectedDate}
            multiDayEvents={multiDayEvents}
            onOpenDetails={onOpenDetails}
          />

          {/* Week header */}
          <div className="relative z-20 flex border-b">
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
        </div>

        <ScrollArea className="h-[736px]">
          <div className="flex overflow-hidden">
            {/* Hours column */}
            <div className="relative w-18">
              {hours.map((hour, index) => (
                <div key={hour} className="relative" style={{ height: '96px' }}>
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
                              'bg-calendar-disabled-hour'
                          )}
                          style={{ height: '96px' }}
                        >
                          {hourIndex !== 0 && (
                            <div className="pointer-events-none absolute inset-x-0 top-0 border-b" />
                          )}

                          {/* 4 time slots per hour (15-minute intervals) */}
                          {canAdd !== false && (
                            <>
                              <div
                                className="absolute inset-x-0 top-0 h-[24px] cursor-pointer transition-colors hover:bg-accent"
                                onClick={() => handleTimeSlotClick(day, hour, 0)}
                              />
                              <div
                                className="absolute inset-x-0 top-[24px] h-[24px] cursor-pointer transition-colors hover:bg-accent"
                                onClick={() => handleTimeSlotClick(day, hour, 15)}
                              />
                            </>
                          )}

                          <div className="pointer-events-none absolute inset-x-0 top-1/2 border-b border-dashed" />

                          {canAdd !== false && (
                            <>
                              <div
                                className="absolute inset-x-0 top-[48px] h-[24px] cursor-pointer transition-colors hover:bg-accent"
                                onClick={() => handleTimeSlotClick(day, hour, 30)}
                              />
                              <div
                                className="absolute inset-x-0 top-[72px] h-[24px] cursor-pointer transition-colors hover:bg-accent"
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

              <CalendarTimeline
                firstVisibleHour={earliestEventHour}
                lastVisibleHour={latestEventHour}
              />
            </div>
          </div>
        </ScrollArea>
      </div>
    </>
  )
}
