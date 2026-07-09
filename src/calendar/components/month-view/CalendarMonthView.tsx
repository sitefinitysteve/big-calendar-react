import { useMemo } from 'react'
import { useCalendarStore } from '@/stores/calendar'
import { useCalendarGrid } from '@/calendar/hooks/useCalendarGrid'
import { useEventPositioning } from '@/calendar/hooks/useEventPositioning'
import DayCell from '@/calendar/components/month-view/DayCell'
import type { IEvent } from '@/calendar/interfaces'
import { useCalendarLabels } from '@/calendar/labels'

interface CalendarMonthViewProps {
  singleDayEvents: IEvent[]
  multiDayEvents: IEvent[]
  onOpenDetails?: (event: IEvent) => void
  onSelectDay?: (date: Date) => void
}

export default function CalendarMonthView({
  singleDayEvents,
  multiDayEvents,
  onOpenDetails,
  onSelectDay,
}: CalendarMonthViewProps) {
  const labels = useCalendarLabels()
  const selectedDate = useCalendarStore((s) => s.selectedDate)

  const { cells } = useCalendarGrid(selectedDate)
  const { eventPositions } = useEventPositioning(multiDayEvents, singleDayEvents, selectedDate)

  const allEvents = useMemo(
    () => [...multiDayEvents, ...singleDayEvents],
    [multiDayEvents, singleDayEvents]
  )

  const WEEK_DAYS = [
    labels.weekdaySun,
    labels.weekdayMon,
    labels.weekdayTue,
    labels.weekdayWed,
    labels.weekdayThu,
    labels.weekdayFri,
    labels.weekdaySat,
  ]

  return (
    <div>
      <div className="grid grid-cols-7 divide-x">
        {WEEK_DAYS.map((day) => (
          <div key={day} className="flex items-center justify-center py-2">
            <span className="text-xs font-medium text-muted-foreground">{day}</span>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 overflow-hidden">
        {cells.map((cell) => (
          <DayCell
            key={cell.date.toISOString()}
            cell={cell}
            events={allEvents}
            eventPositions={eventPositions}
            onOpenDetails={onOpenDetails}
            onSelectDay={onSelectDay}
          />
        ))}
      </div>
    </div>
  )
}
