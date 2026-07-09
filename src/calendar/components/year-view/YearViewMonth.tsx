import { memo, useMemo } from 'react'
import { isSameDay, parseISO, getDaysInMonth, startOfMonth, format } from 'date-fns'
import { useCalendarStore } from '@/stores/calendar'
import { cn } from '@/lib/utils'
import YearViewDayCell from '@/calendar/components/year-view/YearViewDayCell'
import type { IEvent } from '@/calendar/interfaces'
import { useCalendarLabels, useDateLocale } from '@/calendar/labels'

interface YearViewMonthProps {
  month: Date
  events: IEvent[]
  onSelectDay?: (date: Date) => void
  onSelectMonth?: () => void
}

function YearViewMonth({
  month,
  events,
  onSelectDay,
  onSelectMonth,
}: YearViewMonthProps) {
  const labels = useCalendarLabels()
  const locale = useDateLocale()

  const setSelectedDate = useCalendarStore((s) => s.setSelectedDate)

  const WEEK_DAYS = [
    labels.weekdaySun,
    labels.weekdayMon,
    labels.weekdayTue,
    labels.weekdayWed,
    labels.weekdayThu,
    labels.weekdayFri,
    labels.weekdaySat,
  ]

  const monthName = useMemo(() => {
    const name = format(month, 'MMMM', { locale })
    return name.charAt(0).toUpperCase() + name.slice(1)
  }, [month, locale])

  const days = useMemo(() => {
    const firstDay = startOfMonth(month)
    const dayOfWeek = firstDay.getDay()
    const totalDays = getDaysInMonth(month)

    const blanks: null[] = Array.from({ length: dayOfWeek }, () => null)
    const dayNumbers = Array.from({ length: totalDays }, (_, i) => i + 1)

    return [...blanks, ...dayNumbers]
  }, [month])

  function getDateForDay(day: number): Date {
    return new Date(month.getFullYear(), month.getMonth(), day)
  }

  function getEventsForDay(day: number): IEvent[] {
    const date = getDateForDay(day)
    return events.filter((event) => isSameDay(parseISO(event.startDate), date))
  }

  function handleMonthClick() {
    setSelectedDate(startOfMonth(month))
    onSelectMonth?.()
  }

  return (
    <div className="rounded-lg border p-3">
      <button
        className={cn(
          'mb-2 w-full text-left text-sm font-semibold hover:text-primary focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring rounded px-1',
        )}
        onClick={handleMonthClick}
      >
        {monthName}
      </button>

      <div className="grid grid-cols-7 gap-0">
        {WEEK_DAYS.map((weekDay) => (
          <div key={weekDay} className="flex items-center justify-center pb-1">
            <span className="text-[10px] font-medium text-muted-foreground">
              {weekDay.charAt(0)}
            </span>
          </div>
        ))}

        {days.map((day, index) =>
          day === null ? (
            <div key={index} />
          ) : (
            <YearViewDayCell
              key={index}
              day={day}
              date={getDateForDay(day)}
              events={getEventsForDay(day)}
              onSelectDay={onSelectDay}
            />
          ),
        )}
      </div>
    </div>
  )
}

export default memo(YearViewMonth)
