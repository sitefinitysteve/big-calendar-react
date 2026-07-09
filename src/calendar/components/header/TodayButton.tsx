import { format } from 'date-fns'
import { useCalendarStore } from '@/stores/calendar'
import { useDateLocale } from '@/calendar/labels'

export default function TodayButton() {
  const setSelectedDate = useCalendarStore((s) => s.setSelectedDate)
  const dateLocale = useDateLocale()

  const today = new Date()

  function handleClick() {
    setSelectedDate(today)
  }

  return (
    <button
      className="flex size-14 flex-col items-start overflow-hidden rounded-lg border focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
      onClick={handleClick}
    >
      <p className="flex h-6 w-full items-center justify-center bg-primary text-center text-xs font-semibold text-primary-foreground">
        {format(today, 'MMM', dateLocale ? { locale: dateLocale } : undefined).toUpperCase()}
      </p>
      <p className="flex w-full items-center justify-center text-lg font-bold">
        {today.getDate()}
      </p>
    </button>
  )
}
