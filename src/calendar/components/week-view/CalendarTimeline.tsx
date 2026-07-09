import { useMemo } from 'react'
import { format } from 'date-fns'
import { useCurrentTime } from '@/calendar/hooks/useCurrentTime'

interface CalendarTimelineProps {
  firstVisibleHour: number
  lastVisibleHour: number
}

export default function CalendarTimeline({
  firstVisibleHour,
  lastVisibleHour,
}: CalendarTimelineProps) {
  const { currentTime } = useCurrentTime()

  const currentHour = currentTime.getHours()

  const isVisible = currentHour >= firstVisibleHour && currentHour < lastVisibleHour

  const currentTimePosition = useMemo(() => {
    const minutes = currentTime.getHours() * 60 + currentTime.getMinutes()
    const visibleStartMinutes = firstVisibleHour * 60
    const visibleEndMinutes = lastVisibleHour * 60
    const visibleRangeMinutes = visibleEndMinutes - visibleStartMinutes

    return ((minutes - visibleStartMinutes) / visibleRangeMinutes) * 100
  }, [currentTime, firstVisibleHour, lastVisibleHour])

  const formattedTime = format(currentTime, 'h:mm a')

  if (!isVisible) return null

  return (
    <div
      className="pointer-events-none absolute inset-x-0 z-50 border-t border-primary"
      style={{ top: `${currentTimePosition}%` }}
    >
      <div className="absolute left-0 top-0 size-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary" />
      <div className="absolute -left-18 flex w-16 -translate-y-1/2 justify-end bg-background pr-1 text-xs font-medium text-primary">
        {formattedTime}
      </div>
    </div>
  )
}
