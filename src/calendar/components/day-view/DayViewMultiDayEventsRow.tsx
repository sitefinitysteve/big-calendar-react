import { useMemo } from 'react'
import {
  parseISO,
  isWithinInterval,
  differenceInDays,
  startOfDay,
  endOfDay,
} from 'date-fns'
import MonthEventBadge from '@/calendar/components/month-view/MonthEventBadge'
import type { IEvent } from '@/calendar/interfaces'

interface DayViewMultiDayEventsRowProps {
  selectedDate: Date
  multiDayEvents: IEvent[]
  onOpenDetails?: (event: IEvent) => void
}

export default function DayViewMultiDayEventsRow({
  selectedDate,
  multiDayEvents,
  onOpenDetails,
}: DayViewMultiDayEventsRowProps) {
  const multiDayEventsInDay = useMemo(() => {
    const dayStart = startOfDay(selectedDate)
    const dayEnd = endOfDay(selectedDate)

    return multiDayEvents
      .filter((event) => {
        const eventStart = parseISO(event.startDate)
        const eventEnd = parseISO(event.endDate)

        const isOverlapping =
          isWithinInterval(dayStart, { start: eventStart, end: eventEnd }) ||
          isWithinInterval(dayEnd, { start: eventStart, end: eventEnd }) ||
          (eventStart <= dayStart && eventEnd >= dayEnd)

        return isOverlapping
      })
      .sort((a, b) => {
        const durationA = differenceInDays(parseISO(a.endDate), parseISO(a.startDate))
        const durationB = differenceInDays(parseISO(b.endDate), parseISO(b.startDate))
        return durationB - durationA
      })
  }, [selectedDate, multiDayEvents])

  function getEventDays(event: IEvent) {
    const eventStart = startOfDay(parseISO(event.startDate))
    const eventEnd = startOfDay(parseISO(event.endDate))
    const currentDate = startOfDay(selectedDate)

    const eventTotalDays = differenceInDays(eventEnd, eventStart) + 1
    const eventCurrentDay = differenceInDays(currentDate, eventStart) + 1

    return { eventTotalDays, eventCurrentDay }
  }

  if (multiDayEventsInDay.length === 0) return null

  return (
    <div className="flex border-b">
      <div className="w-18" />
      <div className="flex flex-1 flex-col gap-1 border-l py-1">
        {multiDayEventsInDay.map((event) => {
          const { eventTotalDays, eventCurrentDay } = getEventDays(event)
          return (
            <MonthEventBadge
              key={event.id}
              event={event}
              cellDate={selectedDate}
              eventCurrentDay={eventTotalDays > 1 ? eventCurrentDay : undefined}
              eventTotalDays={eventTotalDays > 1 ? eventTotalDays : undefined}
              onOpenDetails={onOpenDetails}
            />
          )
        })}
      </div>
    </div>
  )
}
