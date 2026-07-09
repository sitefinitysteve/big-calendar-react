import { useMemo } from 'react'
import { format, parseISO, areIntervalsOverlapping } from 'date-fns'
import { Calendar as CalendarIcon, Clock, User } from 'lucide-react'

import { useCalendarStore } from '@/stores/calendar'
import { cn } from '@/lib/utils'
import {
  groupEvents,
  getEventBlockStyle,
  isWorkingHour,
  getCurrentEvents,
  getVisibleHours,
} from '@/calendar/helpers'

import { ScrollArea } from '@/components/ui/scroll-area'
import { Calendar } from '@/components/ui/calendar'
import EventBlock from '@/calendar/components/week-view/EventBlock'
import CalendarTimeline from '@/calendar/components/week-view/CalendarTimeline'
import DayViewMultiDayEventsRow from '@/calendar/components/day-view/DayViewMultiDayEventsRow'

import type { IEvent } from '@/calendar/interfaces'
import { useCalendarLabels, useDateLocale } from '@/calendar/labels'

interface CalendarDayViewProps {
  singleDayEvents: IEvent[]
  multiDayEvents: IEvent[]
  canAdd?: boolean
  onOpenDetails?: (event: IEvent) => void
  onAddEvent?: (startDate?: Date, startTime?: { hour: number; minute: number }) => void
}

export default function CalendarDayView({
  singleDayEvents,
  multiDayEvents,
  canAdd,
  onOpenDetails,
  onAddEvent,
}: CalendarDayViewProps) {
  const labels = useCalendarLabels()
  const locale = useDateLocale()

  const selectedDate = useCalendarStore((s) => s.selectedDate)
  const users = useCalendarStore((s) => s.users)
  const workingHours = useCalendarStore((s) => s.workingHours)
  const visibleHours = useCalendarStore((s) => s.visibleHours)
  const setSelectedDate = useCalendarStore((s) => s.setSelectedDate)

  const visibleHoursData = useMemo(
    () => getVisibleHours(visibleHours, singleDayEvents),
    [visibleHours, singleDayEvents],
  )

  const hours = visibleHoursData.hours
  const earliestEventHour = visibleHoursData.earliestEventHour
  const latestEventHour = visibleHoursData.latestEventHour

  const currentEvents = useMemo(() => getCurrentEvents(singleDayEvents), [singleDayEvents])

  const dayEvents = useMemo(
    () =>
      singleDayEvents.filter((event) => {
        const eventDate = parseISO(event.startDate)
        return (
          eventDate.getDate() === selectedDate.getDate() &&
          eventDate.getMonth() === selectedDate.getMonth() &&
          eventDate.getFullYear() === selectedDate.getFullYear()
        )
      }),
    [singleDayEvents, selectedDate],
  )

  const groupedEvents = useMemo(() => groupEvents(dayEvents), [dayEvents])

  function handleCalendarSelect(value: Date | undefined) {
    if (!value) return
    const jsDate = new Date(value.getFullYear(), value.getMonth(), value.getDate())
    setSelectedDate(jsDate)
  }

  function formatHour(hour: number): string {
    return format(new Date(2000, 0, 1, hour, 0, 0, 0), 'hh a')
  }

  function getEventStyle(event: IEvent, groupIndex: number) {
    let style = getEventBlockStyle(
      event,
      new Date(selectedDate),
      groupIndex,
      groupedEvents.length,
      { from: earliestEventHour, to: latestEventHour },
    )

    const hasOverlap = groupedEvents.some(
      (otherGroup, otherIndex) =>
        otherIndex !== groupIndex &&
        otherGroup.some((otherEvent) =>
          areIntervalsOverlapping(
            { start: parseISO(event.startDate), end: parseISO(event.endDate) },
            { start: parseISO(otherEvent.startDate), end: parseISO(otherEvent.endDate) },
          ),
        ),
    )

    if (!hasOverlap) {
      style = { ...style, width: '100%', left: '0%' }
    }

    return style
  }

  return (
    <div className="flex">
      {/* Left side: timeline and day grid */}
      <div className="flex flex-1 flex-col">
        <div>
          <DayViewMultiDayEventsRow
            selectedDate={selectedDate}
            multiDayEvents={multiDayEvents}
            onOpenDetails={(event) => onOpenDetails?.(event)}
          />

          {/* Day header */}
          <div className="relative z-20 flex border-b">
            <div className="w-18" />
            <span className="flex-1 border-l py-2 text-center text-xs font-medium text-muted-foreground">
              {format(selectedDate, 'EE', { locale })}{' '}
              <span className="font-semibold text-foreground">{format(selectedDate, 'd')}</span>
            </span>
          </div>
        </div>

        <ScrollArea className="h-[800px]">
          <div className="flex">
            {/* Hours column */}
            <div className="relative w-18">
              {hours.map((hour, index) => (
                <div key={hour} className="relative" style={{ height: '96px' }}>
                  <div className="absolute -top-3 right-2 flex h-6 items-center">
                    {index !== 0 && (
                      <span className="text-xs text-muted-foreground">{formatHour(hour)}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Day grid */}
            <div className="relative flex-1 border-l">
              <div className="relative">
                {hours.map((hour, index) => (
                  <div
                    key={hour}
                    className={cn(
                      'relative',
                      !isWorkingHour(selectedDate, hour, workingHours) &&
                        'bg-calendar-disabled-hour',
                    )}
                    style={{ height: '96px' }}
                  >
                    {index !== 0 && (
                      <div className="pointer-events-none absolute inset-x-0 top-0 border-b" />
                    )}

                    {/* 4 clickable time slots per hour */}
                    {canAdd !== false && (
                      <>
                        <div
                          className="absolute inset-x-0 top-0 h-[24px] cursor-pointer transition-colors hover:bg-accent"
                          onClick={() => onAddEvent?.(selectedDate, { hour, minute: 0 })}
                        />
                        <div
                          className="absolute inset-x-0 top-[24px] h-[24px] cursor-pointer transition-colors hover:bg-accent"
                          onClick={() => onAddEvent?.(selectedDate, { hour, minute: 15 })}
                        />
                      </>
                    )}

                    <div className="pointer-events-none absolute inset-x-0 top-1/2 border-b border-dashed" />

                    {canAdd !== false && (
                      <>
                        <div
                          className="absolute inset-x-0 top-[48px] h-[24px] cursor-pointer transition-colors hover:bg-accent"
                          onClick={() => onAddEvent?.(selectedDate, { hour, minute: 30 })}
                        />
                        <div
                          className="absolute inset-x-0 top-[72px] h-[24px] cursor-pointer transition-colors hover:bg-accent"
                          onClick={() => onAddEvent?.(selectedDate, { hour, minute: 45 })}
                        />
                      </>
                    )}
                  </div>
                ))}

                {/* Positioned event blocks */}
                {groupedEvents.map((group, groupIndex) => (
                  <div key={`group-${groupIndex}`} style={{ display: 'contents' }}>
                    {group.map((event) => (
                      <div
                        key={event.id}
                        className="absolute p-1"
                        style={getEventStyle(event, groupIndex)}
                      >
                        <EventBlock
                          event={event}
                          onOpenDetails={(e) => onOpenDetails?.(e)}
                        />
                      </div>
                    ))}
                  </div>
                ))}
              </div>

              <CalendarTimeline
                firstVisibleHour={earliestEventHour}
                lastVisibleHour={latestEventHour}
              />
            </div>
          </div>
        </ScrollArea>
      </div>

      {/* Right sidebar */}
      <div className="hidden w-64 divide-y border-l md:block">
        {/* Mini calendar */}
        <Calendar
          className="mx-auto w-fit"
          mode="single"
          selected={selectedDate}
          onSelect={handleCalendarSelect}
        />

        {/* Happening now section */}
        <div className="flex-1 space-y-3">
          {currentEvents.length > 0 ? (
            <>
              <div className="flex items-start gap-2 px-4 pt-4">
                <span className="relative mt-[5px] flex size-2.5">
                  <span className="absolute inline-flex size-full animate-ping rounded-full bg-green-400 opacity-75" />
                  <span className="relative inline-flex size-2.5 rounded-full bg-green-600" />
                </span>

                <p className="text-sm font-semibold text-foreground">{labels.happeningNow}</p>
              </div>

              <ScrollArea className="h-[422px] px-4">
                <div className="space-y-6 pb-4">
                  {currentEvents.map((event) => {
                    const eventUser = users.find((u) => u.id === event.user.id)
                    return (
                      <div key={event.id} className="space-y-1.5">
                        <p className="line-clamp-2 text-sm font-semibold">{event.title}</p>

                        {eventUser && (
                          <div className="flex items-center gap-1.5 text-muted-foreground">
                            <User className="size-3.5" />
                            <span className="text-sm">{eventUser.name}</span>
                          </div>
                        )}

                        <div className="flex items-center gap-1.5 text-muted-foreground">
                          <CalendarIcon className="size-3.5" />
                          <span className="text-sm">
                            {format(new Date(), 'MMM d, yyyy', { locale })}
                          </span>
                        </div>

                        <div className="flex items-center gap-1.5 text-muted-foreground">
                          <Clock className="size-3.5" />
                          <span className="text-sm">
                            {event.isAllDay ? (
                              labels.allDay
                            ) : (
                              <>
                                {format(parseISO(event.startDate), 'h:mm a')} -{' '}
                                {format(parseISO(event.endDate), 'h:mm a')}
                              </>
                            )}
                          </span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </ScrollArea>
            </>
          ) : (
            <p className="p-4 text-center text-sm italic text-muted-foreground">
              {labels.noCurrentEvents}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
