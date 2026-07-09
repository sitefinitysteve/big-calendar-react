import { useMemo } from 'react'
import { format } from 'date-fns'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useCalendarStore } from '@/stores/calendar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { getEventsCount, navigateDate, rangeText } from '@/calendar/helpers'
import type { IEvent } from '@/calendar/interfaces'
import type { TCalendarView } from '@/calendar/types'
import { useCalendarLabels, useDateLocale } from '@/calendar/labels'

interface DateNavigatorProps {
  view: TCalendarView
  events: IEvent[]
}

export default function DateNavigator({ view, events }: DateNavigatorProps) {
  const selectedDate = useCalendarStore((s) => s.selectedDate)
  const setSelectedDate = useCalendarStore((s) => s.setSelectedDate)
  const labels = useCalendarLabels()
  const dateLocale = useDateLocale()

  const month = useMemo(() => {
    const name = format(selectedDate, 'MMMM', dateLocale ? { locale: dateLocale } : undefined)
    return name.charAt(0).toUpperCase() + name.slice(1)
  }, [selectedDate, dateLocale])
  const year = selectedDate.getFullYear()
  const eventCount = useMemo(() => getEventsCount(events, selectedDate, view), [events, selectedDate, view])

  function handlePrevious() {
    setSelectedDate(navigateDate(selectedDate, view, 'previous'))
  }

  function handleNext() {
    setSelectedDate(navigateDate(selectedDate, view, 'next'))
  }

  return (
    <div className="space-y-0.5">
      <div className="flex items-center gap-2">
        <span className="text-lg font-semibold">{month} {year}</span>
        <Badge variant="outline" className="px-1.5">
          {labels.eventsCount(eventCount)}
        </Badge>
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          className="size-6.5 px-0 [&_svg]:size-4.5"
          onClick={handlePrevious}
        >
          <ChevronLeft />
        </Button>

        <p className="text-sm capitalize text-muted-foreground">
          {rangeText(view, selectedDate, dateLocale)}
        </p>

        <Button
          variant="outline"
          className="size-6.5 px-0 [&_svg]:size-4.5"
          onClick={handleNext}
        >
          <ChevronRight />
        </Button>
      </div>
    </div>
  )
}
