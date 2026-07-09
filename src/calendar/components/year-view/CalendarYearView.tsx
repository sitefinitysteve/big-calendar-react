import { useMemo } from 'react'
import { addMonths, startOfYear } from 'date-fns'
import { useCalendarStore } from '@/stores/calendar'
import YearViewMonth from '@/calendar/components/year-view/YearViewMonth'
import type { IEvent } from '@/calendar/interfaces'

interface CalendarYearViewProps {
  allEvents: IEvent[]
  onSelectDay?: (date: Date) => void
  onSelectMonth?: () => void
}

export default function CalendarYearView({
  allEvents,
  onSelectDay,
  onSelectMonth,
}: CalendarYearViewProps) {
  const selectedDate = useCalendarStore((s) => s.selectedDate)

  const months = useMemo(() => {
    const yearStart = startOfYear(selectedDate)
    return Array.from({ length: 12 }, (_, i) => addMonths(yearStart, i))
  }, [selectedDate])

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {months.map((month) => (
        <YearViewMonth
          key={month.toISOString()}
          month={month}
          events={allEvents}
          onSelectDay={onSelectDay}
          onSelectMonth={onSelectMonth}
        />
      ))}
    </div>
  )
}
