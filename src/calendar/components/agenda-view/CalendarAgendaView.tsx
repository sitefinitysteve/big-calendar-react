import { useMemo } from 'react'
import { addDays, differenceInDays, format, isSameMonth, parseISO, startOfDay } from 'date-fns'
import { CalendarX2 } from 'lucide-react'
import { useCalendarStore } from '@/stores/calendar'
import { ScrollArea } from '@/components/ui/scroll-area'
import type { IEvent } from '@/calendar/interfaces'
import AgendaDayGroup from '@/calendar/components/agenda-view/AgendaDayGroup'
import { useCalendarLabels } from '@/calendar/labels'

interface CalendarAgendaViewProps {
  singleDayEvents: IEvent[]
  multiDayEvents: IEvent[]
  onOpenDetails?: (event: IEvent) => void
}

interface DayEntry {
  date: Date
  singleDayEvents: IEvent[]
  multiDayEvents: IEvent[]
}

export default function CalendarAgendaView({ singleDayEvents, multiDayEvents, onOpenDetails }: CalendarAgendaViewProps) {
  const labels = useCalendarLabels()
  const selectedDate = useCalendarStore((s) => s.selectedDate)

  const eventsByDay = useMemo<DayEntry[]>(() => {
    const dayMap = new Map<string, { singleDayEvents: IEvent[]; multiDayEvents: IEvent[] }>()

    // Group single-day events by their start date
    for (const event of singleDayEvents) {
      const eventDate = startOfDay(parseISO(event.startDate))
      if (!isSameMonth(eventDate, selectedDate)) continue

      const key = format(eventDate, 'yyyy-MM-dd')
      if (!dayMap.has(key)) {
        dayMap.set(key, { singleDayEvents: [], multiDayEvents: [] })
      }
      dayMap.get(key)!.singleDayEvents.push(event)
    }

    // Spread multi-day events across their date range
    for (const event of multiDayEvents) {
      const eventStart = startOfDay(parseISO(event.startDate))
      const eventEnd = startOfDay(parseISO(event.endDate))
      const totalDays = differenceInDays(eventEnd, eventStart) + 1

      for (let i = 0; i < totalDays; i++) {
        const currentDate = addDays(eventStart, i)
        if (!isSameMonth(currentDate, selectedDate)) continue

        const key = format(currentDate, 'yyyy-MM-dd')
        if (!dayMap.has(key)) {
          dayMap.set(key, { singleDayEvents: [], multiDayEvents: [] })
        }
        dayMap.get(key)!.multiDayEvents.push(event)
      }
    }

    // Sort by date and return as array
    return Array.from(dayMap.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, value]) => ({
        date: new Date(key),
        singleDayEvents: value.singleDayEvents,
        multiDayEvents: value.multiDayEvents,
      }))
  }, [singleDayEvents, multiDayEvents, selectedDate])

  const hasEvents = eventsByDay.length > 0

  return (
    <ScrollArea className="h-[800px]">
      {hasEvents ? (
        <div className="space-y-6 p-4">
          {eventsByDay.map((day) => (
            <AgendaDayGroup
              key={format(day.date, 'yyyy-MM-dd')}
              date={day.date}
              events={day.singleDayEvents}
              multiDayEvents={day.multiDayEvents}
              onOpenDetails={onOpenDetails}
            />
          ))}
        </div>
      ) : (
        <div className="flex h-[800px] flex-col items-center justify-center gap-4 text-muted-foreground">
          <CalendarX2 className="size-16 stroke-1" />
          <p className="text-lg">{labels.noEventsMonth}</p>
        </div>
      )}
    </ScrollArea>
  )
}
