import { useMemo } from 'react'
import type { IEvent } from '@/calendar/interfaces'
import type { TVisibleHours } from '@/calendar/types'
import { getVisibleHours } from '@/calendar/helpers'

export function useVisibleHours(visibleHours: TVisibleHours, singleDayEvents: IEvent[]) {
  const visibleHoursData = useMemo(
    () => getVisibleHours(visibleHours, singleDayEvents),
    [visibleHours, singleDayEvents]
  )

  return {
    hours: visibleHoursData.hours,
    earliestEventHour: visibleHoursData.earliestEventHour,
    latestEventHour: visibleHoursData.latestEventHour,
  }
}
