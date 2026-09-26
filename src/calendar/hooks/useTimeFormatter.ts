import { useCallback } from 'react'
import { useDateLocale } from '@/calendar/labels'
import { formatHour, formatTime } from '@/calendar/date-format'
import { useCalendarCustomization } from '@/calendar/customization'
import type { TTimeFormatter } from '@/calendar/customization'

/**
 * The clock formatter every time label goes through: the host's `formatTime`
 * prop when given, otherwise the locale-aware Intl default.
 */
export function useTimeFormatter(): TTimeFormatter {
  const dateLocale = useDateLocale()
  const { formatTime: custom } = useCalendarCustomization()

  return useCallback<TTimeFormatter>(
    (date, kind) => {
      if (custom) {
        return custom(date, kind)
      }

      return kind === 'axis' ? formatHour(date, dateLocale) : formatTime(date, dateLocale)
    },
    [custom, dateLocale]
  )
}
