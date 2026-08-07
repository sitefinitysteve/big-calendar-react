import { useMemo } from 'react'
import type { IEvent } from '@/calendar/interfaces'
import { calculateMonthEventPositions } from '@/calendar/helpers'

export function useEventPositioning(
  multiDayEvents: IEvent[],
  singleDayEvents: IEvent[],
  selectedDate: Date,
  maxVisible = 3
) {
  const eventPositions = useMemo(
    () => calculateMonthEventPositions(multiDayEvents, singleDayEvents, selectedDate, maxVisible),
    [multiDayEvents, singleDayEvents, selectedDate, maxVisible]
  )
  return { eventPositions }
}
