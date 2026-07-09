import { memo, useMemo } from 'react'
import { format, parseISO, differenceInDays, startOfDay } from 'date-fns'
import type { IEvent } from '@/calendar/interfaces'
import { useDateLocale } from '@/calendar/labels'
import AgendaEventCard from '@/calendar/components/agenda-view/AgendaEventCard'

interface AgendaDayGroupProps {
  date: Date
  events: IEvent[]
  multiDayEvents: IEvent[]
  onOpenDetails?: (event: IEvent) => void
}

function AgendaDayGroup({ date, events, multiDayEvents, onOpenDetails }: AgendaDayGroupProps) {
  const dateLocale = useDateLocale()

  const multiDayEventsWithDayInfo = useMemo(() => {
    return multiDayEvents.map((event) => {
      const eventStart = startOfDay(parseISO(event.startDate))
      const eventEnd = startOfDay(parseISO(event.endDate))
      const totalDays = differenceInDays(eventEnd, eventStart) + 1
      const currentDay = differenceInDays(startOfDay(date), eventStart) + 1
      return { event, currentDay, totalDays }
    })
  }, [multiDayEvents, date])

  const sortedSingleDayEvents = useMemo(() => {
    return [...events].sort(
      (a, b) => parseISO(a.startDate).getTime() - parseISO(b.startDate).getTime()
    )
  }, [events])

  return (
    <div className="space-y-2">
      <h3 className="sticky top-0 z-10 capitalize bg-background/95 py-2 text-sm font-semibold backdrop-blur supports-[backdrop-filter]:bg-background/60">
        {format(date, 'EEEE, MMMM d, yyyy', dateLocale ? { locale: dateLocale } : undefined)}
      </h3>

      <div className="space-y-2">
        {multiDayEventsWithDayInfo.map(({ event, currentDay, totalDays }) => (
          <AgendaEventCard
            key={`multi-${event.id}`}
            event={event}
            eventCurrentDay={totalDays > 1 ? currentDay : undefined}
            eventTotalDays={totalDays > 1 ? totalDays : undefined}
            onOpenDetails={onOpenDetails}
          />
        ))}

        {sortedSingleDayEvents.map((event) => (
          <AgendaEventCard key={event.id} event={event} onOpenDetails={onOpenDetails} />
        ))}
      </div>
    </div>
  )
}

export default memo(AgendaDayGroup)
