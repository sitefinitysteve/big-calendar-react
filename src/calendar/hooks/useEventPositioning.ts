import { useMemo } from 'react'
import type { IEvent } from '@/calendar/interfaces'
import { calculateMonthEventPositions } from '@/calendar/helpers'

export function useEventPositioning(
  multiDayEvents: IEvent[],
  singleDayEvents: IEvent[],
  selectedDate: Date
) {
  const eventPositions = useMemo(
    () => calculateMonthEventPositions(multiDayEvents, singleDayEvents, selectedDate),
    [multiDayEvents, singleDayEvents, selectedDate]
  )
  return { eventPositions }
}
