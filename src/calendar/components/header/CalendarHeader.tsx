import { Fragment, useMemo } from 'react'
import { List, Columns, Grid2x2, Grid3x3, CalendarRange, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import UserSelect from '@/calendar/components/header/UserSelect'
import TodayButton from '@/calendar/components/header/TodayButton'
import DateNavigator from '@/calendar/components/header/DateNavigator'
import type { IEvent } from '@/calendar/interfaces'
import type { TCalendarView } from '@/calendar/types'
import type { ICalendarLabels } from '@/calendar/labels'
import { useCalendarLabels, useCalendarFlags } from '@/calendar/labels'

interface CalendarHeaderProps {
  view: TCalendarView
  events: IEvent[]
  canAdd?: boolean
  availableViews?: TCalendarView[]
  showUserSelect?: boolean
  onAddEvent?: () => void
  onViewChange?: (view: TCalendarView) => void
}

type TTooltipKey =
  | 'viewDayTooltip'
  | 'viewWeekTooltip'
  | 'viewMonthTooltip'
  | 'viewYearTooltip'
  | 'viewAgendaTooltip'

const VIEW_BUTTONS: { view: TCalendarView; tooltipKey: TTooltipKey; icon: typeof List }[] = [
  { view: 'day', tooltipKey: 'viewDayTooltip', icon: List },
  { view: 'week', tooltipKey: 'viewWeekTooltip', icon: Columns },
  { view: 'month', tooltipKey: 'viewMonthTooltip', icon: Grid2x2 },
  { view: 'year', tooltipKey: 'viewYearTooltip', icon: Grid3x3 },
  { view: 'agenda', tooltipKey: 'viewAgendaTooltip', icon: CalendarRange },
]

export default function CalendarHeader({
  view,
  events,
  canAdd,
  availableViews = ['day', 'week', 'month', 'year', 'agenda'],
  showUserSelect = true,
  onAddEvent,
  onViewChange,
}: CalendarHeaderProps) {
  const labels = useCalendarLabels()
  const { showViewTooltips } = useCalendarFlags()

  const visibleViewButtons = useMemo(() => {
    const filtered = VIEW_BUTTONS.filter((btn) => availableViews.includes(btn.view))
    return filtered.map((btn, index) => {
      let roundedClass: string
      if (filtered.length === 1) roundedClass = ''
      else if (index === 0) roundedClass = 'rounded-r-none'
      else if (index === filtered.length - 1) roundedClass = '-ml-px rounded-l-none'
      else roundedClass = '-ml-px rounded-none'
      return { ...btn, roundedClass }
    })
  }, [availableViews])

  const labelFor = (key: TTooltipKey) => labels[key] as ICalendarLabels[TTooltipKey]

  return (
    <div className="bc-header flex flex-col gap-4 border-b p-4 lg:flex-row lg:items-center lg:justify-between">
      <div className="flex items-center gap-3">
        <TodayButton />
        <DateNavigator view={view} events={events} />
      </div>

      <div className="flex flex-col items-center gap-1.5 sm:flex-row sm:justify-between">
        <div className="flex w-full items-center gap-1.5">
          {visibleViewButtons.length > 1 && (
            <TooltipProvider>
              <div className="bc-view-buttons inline-flex">
                {visibleViewButtons.map((btn) => {
                  const Icon = btn.icon
                  const button = (
                    <Button
                      aria-label={labelFor(btn.tooltipKey)}
                      data-view={btn.view}
                      size="icon"
                      variant={view === btn.view ? 'default' : 'outline'}
                      className={cn(btn.roundedClass, '[&_svg]:size-5', `bc-view-${btn.view}`)}
                      onClick={() => onViewChange?.(btn.view)}
                    >
                      <Icon strokeWidth={1.8} />
                    </Button>
                  )

                  if (!showViewTooltips) {
                    return <Fragment key={btn.view}>{button}</Fragment>
                  }

                  return (
                    <Tooltip key={btn.view}>
                      <TooltipTrigger render={button} />
                      <TooltipContent>
                        {labelFor(btn.tooltipKey)}
                      </TooltipContent>
                    </Tooltip>
                  )
                })}
              </div>
            </TooltipProvider>
          )}

          {showUserSelect && <UserSelect />}
        </div>

        {canAdd !== false && (
          <Button className="w-full sm:w-auto" onClick={() => onAddEvent?.()}>
            <Plus />
            {labels.addEvent}
          </Button>
        )}
      </div>
    </div>
  )
}
