import { useMemo } from 'react'
import { getCalendarCells } from '@/calendar/helpers'
import type { TWeekStartsOn } from '@/calendar/types'

export function useCalendarGrid(selectedDate: Date, weekStartsOn: TWeekStartsOn = 0) {
  const cells = useMemo(() => getCalendarCells(selectedDate, weekStartsOn), [selectedDate, weekStartsOn])
  return { cells }
}
