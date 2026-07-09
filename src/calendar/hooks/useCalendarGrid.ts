import { useMemo } from 'react'
import { getCalendarCells } from '@/calendar/helpers'

export function useCalendarGrid(selectedDate: Date) {
  const cells = useMemo(() => getCalendarCells(selectedDate), [selectedDate])
  return { cells }
}
