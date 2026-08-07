import { memo, useMemo } from 'react'
import { format, isToday, startOfDay } from 'date-fns'
import { useCalendarStore } from '@/stores/calendar'
import EventBullet from '@/calendar/components/month-view/EventBullet'
import MonthEventBadge from '@/calendar/components/month-view/MonthEventBadge'
import { cn } from '@/lib/utils'
import { getMonthCellEvents } from '@/calendar/helpers'
import type { ICalendarCell, IEvent } from '@/calendar/interfaces'
import { useCalendarLabels } from '@/calendar/labels'
import { useCalendarCustomization } from '@/calendar/customization'

interface DayCellProps {
  cell: ICalendarCell
  events: IEvent[]
  eventPositions: Record<string, number>
  onOpenDetails?: (event: IEvent) => void
  onSelectDay?: (date: Date) => void
}

/** Stock list height (`lg:h-[94px]`) is sized for exactly 3 badge slots. */
const DEFAULT_MAX_VISIBLE_EVENTS = 3
const DEFAULT_LIST_HEIGHT = 94

function DayCell({
  cell,
  events,
  eventPositions,
  onOpenDetails,
  onSelectDay,
}: DayCellProps) {
  const labels = useCalendarLabels()
  const setSelectedDate = useCalendarStore((s) => s.setSelectedDate)
  const { maxEventsPerDayCell, onShowMore, classNames, dayCellClassName } =
    useCalendarCustomization()

  const cellEvents = useMemo(
    () => getMonthCellEvents(cell.date, events, eventPositions),
    [cell.date, events, eventPositions]
  )

  const isSunday = cell.date.getDay() === 0
  const isDefaultMax = maxEventsPerDayCell === DEFAULT_MAX_VISIBLE_EVENTS
  const positions = useMemo(
    () => Array.from({ length: maxEventsPerDayCell }, (_, i) => i),
    [maxEventsPerDayCell]
  )
  const hiddenCount = cellEvents.length - maxEventsPerDayCell

  function handleClick() {
    setSelectedDate(cell.date)
    onSelectDay?.(cell.date)
  }

  const moreLabel = (
    <>
      <span className="sm:hidden">+{hiddenCount}</span>
      <span className="hidden sm:inline"> {labels.moreEvents(hiddenCount)}</span>
    </>
  )

  return (
    <div
      data-date={format(cell.date, 'yyyy-MM-dd')}
      className={cn(
        'flex h-full flex-col gap-1 border-l border-t py-1.5 lg:pb-2 lg:pt-1',
        isSunday && 'border-l-0',
        classNames?.dayCell,
        dayCellClassName?.(cell.date)
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
          'flex h-6 gap-1 px-2 lg:flex-col lg:gap-2 lg:px-0',
          isDefaultMax ? 'lg:h-[94px]' : 'bc-day-cell-list',
          !cell.currentMonth && 'opacity-50'
        )}
        style={
          isDefaultMax
            ? undefined
            : // `.bc-day-cell-list` reads this at the lg breakpoint; each slot keeps
              // the stock ~31px so the cell grows proportionally with the cap.
              ({
                '--bc-day-cell-list-height': `${
                  (DEFAULT_LIST_HEIGHT / DEFAULT_MAX_VISIBLE_EVENTS) * maxEventsPerDayCell
                }px`,
              } as React.CSSProperties)
        }
      >
        {positions.map((position) => {
          const event = cellEvents.find((e) => e.position === position)
          return (
            <div key={position} className="lg:flex-1">
              {event && (
                <>
                  {/* Below `lg` the bullet is the ONLY chip rendered, so it carries
                      the same button wiring the badge has or the event is unreachable. */}
                  <div
                    role="button"
                    tabIndex={0}
                    data-event-id={event.id}
                    data-event-bullet=""
                    className="lg:hidden"
                    onClick={() => onOpenDetails?.(event)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault()
                        onOpenDetails?.(event)
                      }
                    }}
                  >
                    <EventBullet color={event.color} />
                  </div>
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

      {hiddenCount > 0 &&
        (onShowMore ? (
          <button
            type="button"
            className={cn(
              'h-4.5 px-1.5 text-left text-xs font-semibold text-muted-foreground hover:underline focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring',
              !cell.currentMonth && 'opacity-50'
            )}
            onClick={() => onShowMore(format(cell.date, 'yyyy-MM-dd'))}
          >
            {moreLabel}
          </button>
        ) : (
          <p
            className={cn(
              'h-4.5 px-1.5 text-xs font-semibold text-muted-foreground',
              !cell.currentMonth && 'opacity-50'
            )}
          >
            <span className="sm:hidden">+{hiddenCount}</span>
            <span className="hidden sm:inline">
              {' '}
              {labels.moreEvents(hiddenCount)}
            </span>
          </p>
        ))}
    </div>
  )
}

export default memo(DayCell)
