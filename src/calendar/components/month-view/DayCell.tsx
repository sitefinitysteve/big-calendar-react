import { memo, useMemo } from 'react'
import { format, isToday, startOfDay } from 'date-fns'
import { useCalendarStore } from '@/stores/calendar'
import EventBullet from '@/calendar/components/month-view/EventBullet'
import MonthEventBadge from '@/calendar/components/month-view/MonthEventBadge'
import { cn } from '@/lib/utils'
import { getMonthCellEvents } from '@/calendar/helpers'
import type { ICalendarCell, IEvent } from '@/calendar/interfaces'
import { useCalendarLabels } from '@/calendar/labels'

interface DayCellProps {
  cell: ICalendarCell
  events: IEvent[]
  eventPositions: Record<string, number>
  onOpenDetails?: (event: IEvent) => void
  onSelectDay?: (date: Date) => void
}

const MAX_VISIBLE_EVENTS = 3

function DayCell({
  cell,
  events,
  eventPositions,
  onOpenDetails,
  onSelectDay,
}: DayCellProps) {
  const labels = useCalendarLabels()
  const setSelectedDate = useCalendarStore((s) => s.setSelectedDate)

  const cellEvents = useMemo(
    () => getMonthCellEvents(cell.date, events, eventPositions),
    [cell.date, events, eventPositions]
  )

  const isSunday = cell.date.getDay() === 0

  function handleClick() {
    setSelectedDate(cell.date)
    onSelectDay?.(cell.date)
  }

  return (
    <div
      data-date={format(cell.date, 'yyyy-MM-dd')}
      className={cn(
        'flex h-full flex-col gap-1 border-l border-t py-1.5 lg:pb-2 lg:pt-1',
        isSunday && 'border-l-0'
      )}
    >
      <button
        className={cn(
          'flex size-6 translate-x-1 items-center justify-center rounded-full text-xs font-semibold hover:bg-accent focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring lg:px-2',
          !cell.currentMonth && 'opacity-20',
          isToday(cell.date) && 'bg-primary font-bold text-primary-foreground hover:bg-primary'
        )}
        onClick={handleClick}
      >
        {cell.day}
      </button>

      <div
        className={cn(
          'flex h-6 gap-1 px-2 lg:h-[94px] lg:flex-col lg:gap-2 lg:px-0',
          !cell.currentMonth && 'opacity-50'
        )}
      >
        {[0, 1, 2].map((position) => {
          const event = cellEvents.find((e) => e.position === position)
          return (
            <div key={position} className="lg:flex-1">
              {event && (
                <>
                  <EventBullet className="lg:hidden" color={event.color} />
                  <MonthEventBadge
                    className="hidden lg:flex"
                    event={event}
                    cellDate={startOfDay(cell.date)}
                    onOpenDetails={onOpenDetails}
                  />
                </>
              )}
            </div>
          )
        })}
      </div>

      {cellEvents.length > MAX_VISIBLE_EVENTS && (
        <p
          className={cn(
            'h-4.5 px-1.5 text-xs font-semibold text-muted-foreground',
            !cell.currentMonth && 'opacity-50'
          )}
        >
          <span className="sm:hidden">+{cellEvents.length - MAX_VISIBLE_EVENTS}</span>
          <span className="hidden sm:inline">
            {' '}
            {labels.moreEvents(cellEvents.length - MAX_VISIBLE_EVENTS)}
          </span>
        </p>
      )}
    </div>
  )
}

export default memo(DayCell)
