import { memo, useMemo } from 'react'
import { format, isToday } from 'date-fns'
import { useCalendarStore } from '@/stores/calendar'
import { cn } from '@/lib/utils'
import type { IEvent } from '@/calendar/interfaces'
import type { TEventColor } from '@/calendar/types'

interface YearViewDayCellProps {
  day: number
  date: Date
  events: IEvent[]
  onSelectDay?: (date: Date) => void
}

const maxIndicators = 3

const colorMap: Record<TEventColor, string> = {
  blue: 'bg-blue-600',
  green: 'bg-green-600',
  red: 'bg-red-600',
  yellow: 'bg-yellow-600',
  purple: 'bg-purple-600',
  orange: 'bg-orange-600',
  gray: 'bg-neutral-600',
}

function YearViewDayCell({ day, date, events, onSelectDay }: YearViewDayCellProps) {
  const setSelectedDate = useCalendarStore((s) => s.setSelectedDate)

  const isTodayCell = useMemo(() => isToday(date), [date])

  const visibleDots = useMemo(() => {
    if (events.length === 0) return []
    if (events.length <= maxIndicators) return events
    return events.slice(0, 1)
  }, [events])

  const overflowCount = useMemo(() => {
    if (events.length <= maxIndicators) return 0
    return events.length - 1
  }, [events])

  function handleClick() {
    setSelectedDate(date)
    onSelectDay?.(date)
  }

  return (
    <button
      data-date={format(date, 'yyyy-MM-dd')}
      className={cn(
        'flex flex-col items-center justify-start gap-0.5 rounded-md p-0.5 text-xs hover:bg-accent focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring',
      )}
      onClick={handleClick}
    >
      <span
        className={cn(
          'flex size-6 items-center justify-center rounded-full text-xs font-medium',
          isTodayCell && 'bg-primary font-bold text-primary-foreground',
        )}
      >
        {day}
      </span>

      {events.length > 0 && (
        <div className="flex items-center gap-0.5">
          {visibleDots.map((event, index) => (
            <span key={index} className={cn('size-1.5 rounded-full', colorMap[event.color])} />
          ))}
          {overflowCount > 0 && (
            <span className="text-[9px] leading-none text-muted-foreground">+{overflowCount}</span>
          )}
        </div>
      )}
    </button>
  )
}

export default memo(YearViewDayCell)
